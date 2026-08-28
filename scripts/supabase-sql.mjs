#!/usr/bin/env node
// Run a read/write SQL statement against the linked project through the
// Supabase Management API (token-only, same auth as scripts/supabase-migrate.mjs).
// For quick checks and one-off maintenance - migrations belong in
// supabase/migrations/ and run via `npm run db:migrate`.
//
//   npm run db:sql -- "select email from auth.users"
//   npm run db:sql -- --file path/to/query.sql

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

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

const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref =
  process.env.SUPABASE_PROJECT_REF ||
  (process.env.NEXT_PUBLIC_SUPABASE_URL || "").match(/https:\/\/([a-z0-9]+)\.supabase\./)?.[1];

if (!token || !ref) {
  console.error("Need SUPABASE_ACCESS_TOKEN in .env.local and a project ref from NEXT_PUBLIC_SUPABASE_URL.");
  process.exit(1);
}

const args = process.argv.slice(2);
const sql =
  args[0] === "--file"
    ? readFileSync(args[1], "utf8")
    : args.join(" ").trim();

if (!sql) {
  console.error('Usage: npm run db:sql -- "select ..."   |   npm run db:sql -- --file query.sql');
  process.exit(1);
}

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: sql }),
});
const text = await res.text();
if (!res.ok) {
  console.error(`${res.status} ${res.statusText}: ${text}`);
  process.exit(1);
}
console.log(text ? JSON.stringify(JSON.parse(text), null, 2) : "(no rows)");
