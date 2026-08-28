#!/usr/bin/env node
// Applies supabase/migrations/*.sql to the linked project through the Supabase
// Management API. Needs a personal access token (token-only, no DB password):
//
//   1. Create one at https://supabase.com/dashboard/account/tokens
//   2. Add it to .env.local  ->  SUPABASE_ACCESS_TOKEN=sbp_xxx
//
// The project ref is read from NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_PROJECT_REF).
// Applied versions are tracked in supabase_migrations.schema_migrations, the same
// table the Supabase CLI uses, so `supabase db push` stays compatible.
//
//   node scripts/supabase-migrate.mjs            apply pending migrations
//   node scripts/supabase-migrate.mjs --status   show local vs remote
//   node scripts/supabase-migrate.mjs --dry-run  print what would run

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = join(root, "supabase", "migrations");

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const path = join(root, file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match && !(match[1] in process.env)) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
      }
    }
  }
}

loadEnv();

const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref =
  process.env.SUPABASE_PROJECT_REF ||
  (process.env.NEXT_PUBLIC_SUPABASE_URL || "").match(/https:\/\/([a-z0-9]+)\.supabase\./)?.[1];

if (!token) {
  console.error("Missing SUPABASE_ACCESS_TOKEN (add it to .env.local).");
  process.exit(1);
}
if (!ref) {
  console.error("Could not determine project ref from NEXT_PUBLIC_SUPABASE_URL.");
  process.exit(1);
}

const mode = process.argv[2] ?? "";

async function query(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${text}`);
  return text ? JSON.parse(text) : null;
}

const localMigrations = existsSync(migrationsDir)
  ? readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort()
      .map((file) => {
        const version = file.match(/^(\d+)/)?.[1];
        return { file, version, name: file.replace(/^\d+_?/, "").replace(/\.sql$/, "") };
      })
      .filter((m) => m.version)
  : [];

if (localMigrations.length === 0) {
  console.log("No migrations found in supabase/migrations/");
  process.exit(0);
}

await query(`
  create schema if not exists supabase_migrations;
  create table if not exists supabase_migrations.schema_migrations (
    version text primary key,
    name text,
    statements text[]
  );
`);

const applied = new Set(
  (await query("select version from supabase_migrations.schema_migrations order by version;")).map(
    (row) => row.version,
  ),
);

const pending = localMigrations.filter((m) => !applied.has(m.version));

if (mode === "--status") {
  for (const m of localMigrations) {
    console.log(`${applied.has(m.version) ? "✓ applied" : "• pending"}  ${m.version}  ${m.name}`);
  }
  process.exit(0);
}

if (pending.length === 0) {
  console.log("Everything up to date.");
  process.exit(0);
}

for (const m of pending) {
  const sql = readFileSync(join(migrationsDir, m.file), "utf8");
  if (mode === "--dry-run") {
    console.log(`\n--- ${m.file} ---\n${sql}`);
    continue;
  }
  process.stdout.write(`Applying ${m.file} ... `);
  await query(sql);
  await query(
    `insert into supabase_migrations.schema_migrations (version, name) values ('${m.version}', '${m.name.replace(/'/g, "''")}') on conflict (version) do nothing;`,
  );
  console.log("done");
}

console.log(mode === "--dry-run" ? "\n(dry run, nothing applied)" : `\nApplied ${pending.length} migration(s).`);
