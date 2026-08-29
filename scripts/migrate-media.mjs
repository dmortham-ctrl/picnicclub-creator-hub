#!/usr/bin/env node
// One-off: pull avatar/brand images that are still hot-linked from
// picnicclub.id/wp-content into the Supabase `Avatar` bucket, then rewrite the
// database URLs. Removes the WordPress hosting dependency before DNS cutover.
//
// Needs SUPABASE_SERVICE_ROLE_KEY in .env.local (Storage uploads bypass RLS).
//
//   node scripts/migrate-media.mjs            migrate
//   node scripts/migrate-media.mjs --dry-run  list what would change

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, extname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
for (const file of [".env.local", ".env"]) {
  const path = join(root, file);
  if (!existsSync(path)) continue;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const dryRun = process.argv.includes("--dry-run");
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const BUCKET = "Avatar";
const NEEDS_MIGRATION = /picnicclub\.id\/wp-content/i;

const contentType = (name) =>
  ({ ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml" })[
    extname(name).toLowerCase()
  ] ?? "image/jpeg";

async function migrateOne(sourceUrl, keyBase) {
  const res = await fetch(sourceUrl);
  if (!res.ok) throw new Error(`fetch ${res.status} ${sourceUrl}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  const ext = extname(new URL(sourceUrl).pathname) || ".jpeg";
  const path = `migrated/${keyBase}${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: contentType(path), upsert: true });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

async function run(table, idCol, urlCol, labelCol) {
  const { data, error } = await supabase.from(table).select(`${idCol}, ${urlCol}, ${labelCol}`);
  if (error) throw error;
  const targets = (data ?? []).filter((row) => NEEDS_MIGRATION.test(row[urlCol] ?? ""));
  console.log(`\n${table}: ${targets.length} to migrate`);
  for (const row of targets) {
    const keyBase = `${table}-${row[idCol]}`;
    if (dryRun) {
      console.log(`  ${row[labelCol]}: ${row[urlCol]}`);
      continue;
    }
    try {
      const newUrl = await migrateOne(row[urlCol], keyBase);
      const { error: updErr } = await supabase.from(table).update({ [urlCol]: newUrl }).eq(idCol, row[idCol]);
      if (updErr) throw updErr;
      console.log(`  ✓ ${row[labelCol]}`);
    } catch (err) {
      console.error(`  ✗ ${row[labelCol]}: ${err.message}`);
    }
  }
}

await run("profiles", "id", "avatar_url", "display_name");
await run("brands", "id", "logo_url", "name");
console.log(dryRun ? "\n(dry run)" : "\nDone. Redeploy so ISR/SSG pages pick up the new URLs.");
