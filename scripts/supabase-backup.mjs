#!/usr/bin/env node
// Dumps every application table to a timestamped JSON file under backups/.
// Token-only (same auth as scripts/supabase-migrate.mjs). Run before the
// production cutover and on a schedule once live.
//
//   npm run db:backup

import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

for (const file of [".env.local", ".env"]) {
  const path = join(root, file);
  if (!existsSync(path)) continue;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref =
  process.env.SUPABASE_PROJECT_REF ||
  (process.env.NEXT_PUBLIC_SUPABASE_URL || "").match(/https:\/\/([a-z0-9]+)\.supabase\./)?.[1];
if (!token || !ref) {
  console.error("Need SUPABASE_ACCESS_TOKEN in .env.local and a project ref.");
  process.exit(1);
}

const TABLES = ["admins", "profiles", "profile_links", "site_content", "brands", "faqs", "analytics_events"];

async function query(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status}: ${text}`);
  return JSON.parse(text);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const dir = join(root, "backups");
mkdirSync(dir, { recursive: true });

const dump = { taken_at: new Date().toISOString(), project_ref: ref, tables: {} };
for (const table of TABLES) {
  const rows = await query(`select * from public.${table} order by 1`);
  dump.tables[table] = rows;
  console.log(`${table}: ${rows.length} rows`);
}

const out = join(dir, `backup-${stamp}.json`);
writeFileSync(out, JSON.stringify(dump, null, 2));
console.log(`\nWrote ${out}`);
console.log("Note: this is data only. Supabase Storage (the Avatar bucket) is backed up separately -");
console.log("use the Supabase dashboard or `supabase storage` CLI for media.");
