# WordPress → Next.js Migration Runbook

Status: **cutover executed 29 Aug 2026.** `picnicclub.id` now serves the
Next.js app on Vercel over HTTPS. Global DNS propagation and Search Console
re-indexing were still settling at handover; WordPress stays online (frozen)
until indexing is confirmed.

## 0. What was actually done

- **Vercel project**: `picnicclub-creator-hub` (team `dmortham`, Hobby),
  linked to `github.com/dmortham-ctrl/picnicclub-creator-hub`, auto-deploys on
  push to `main`. Env: `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the publishable key).
- **Domains on Vercel**: `picnicclub.id` (Production, canonical) and
  `www.picnicclub.id` (308 redirect to apex).
- **DNS**: nameservers moved from Domosquare (`*.dns-ds.com` /
  `freedns*.domosquare.com`) to **Cloudflare** (`gannon`/`paityn.ns.cloudflare.com`),
  because the Domosquare/Berdu record editor was not reliably authoritative.
  Cloudflare records, **DNS only (not proxied)**:
  - `A  picnicclub.id  → 76.76.21.21`
  - `CNAME  www  → cname.vercel-dns.com`
- **Registrar** (Berdu / sb1mofficial.com): nameserver change made under the
  domain's EPP tab; "Theft Protection" was toggled off for the change and
  should be turned back on.
- **TLS**: issued automatically by Vercel (Let's Encrypt) once DNS resolved
  to `76.76.21.21`.
- **Supabase Auth**: Site URL set to `https://picnicclub.id`; redirect URLs
  include `https://picnicclub.id/**`, `https://picnicclub-creator-hub.vercel.app/**`,
  `https://picnicclub-creator-hub-*.vercel.app/**`, and localhost.

### Rollback

DNS is the switch. To revert: in Cloudflare DNS set
`A picnicclub.id → 103.139.175.28` (the old WordPress server, PT Cybertechtonic),
and `www` back to a CNAME to the apex. Or, at the registrar, point nameservers
back to `freedns1.domosquare.com` / `freedns2.domosquare.com`. Supabase data is
untouched by a rollback.

## 1. What the old site actually contains

The live WordPress site at `picnicclub.id` is very small (audited 29 Aug 2026
via `wp-sitemap.xml` + page crawl):

| URL | Content | Migration decision |
|---|---|---|
| `/` | The whole marketing site (hero, stats, partners, FAQ, founders, CTAs) | **Rebuilt** in Next.js (`app/page.tsx`) |
| `/pelanggaran/` | TikTok violation-appeal guide, links a Google Form | **Rebuilt** at `/pelanggaran` (`app/pelanggaran/page.tsx`), same slug |
| `/sample-page/` | WordPress default | 301 → `/` |
| `/2026/06/11/hello-world/` | WordPress default post | 301 → `/` |
| `/category/uncategorized/` | WordPress default term | 301 → `/members` |
| `/feed/`, `/comments/feed/` | RSS (only the junk post) | 301 → `/` |
| `/wp-sitemap.xml` + Yoast sub-sitemaps, `/sitemaps.xml` | Old sitemaps | 301 → `/sitemap.xml` |
| `/wp-admin/*`, `/wp-login.php` | WordPress admin | 301 → `/admin` |
| `/wp-content/uploads/**` | Media (avatars, brand logos) | **Done** — moved to Supabase Storage (§2a) |

The full 301 map lives in `lib/redirects.ts` (`statusCode: 301`) and is wired
through `next.config.ts` `redirects()`.

## 2a. Media — DONE

All 24 hot-linked images (18 avatars + 6 brand logos) were pulled from
`picnicclub.id/wp-content` into the Supabase `Avatar` bucket and the database
URLs rewritten. Run again if new WordPress-hosted URLs ever get added:

```
npm run db:media --dry-run   # list
npm run db:media             # migrate + rewrite DB
```

The app no longer depends on WordPress hosting for media. The optional
`LEGACY_MEDIA_ORIGIN` proxy in `next.config.ts` is now just a dormant safety
net — leave it unset.

## 2. Content audit — needs team sign-off before launch

Differences found between the live site and the rebuilt version. None are
blockers, but the team owns the copy (PRD §5.1).

- **Stats.** Live: "2000+ creators", "100+ Affiliators", "100+ Brand
  Collaboration", "100k+ Video Post/month", "100m+ Video Views/month".
  Rebuilt: "2K+ Creators", "100+ Brand collaborations", "100K+ Videos/month",
  "100M+ Views/month" — the "100+ Affiliators" line was dropped. Confirm the
  numbers are still accurate and add a "last updated" note (editable in
  `/superadmin`).
- **Founder name.** Live site labels `@sobatkaryawan` as **"Gufron"**; the
  seed data uses display name "Sobat Karyawan". Fix in the DB if "Gufron" is
  correct.
- **Fee FAQ.** Live: "the smallest compared to other MCNs". Seeded FAQ softens
  this to "potongan fee yang kompetitif". Editable at `/superadmin/faq`.
- **Official platform partners.** Live site shows a "TikTok + Shopee" official
  partners block. The rebuilt homepage only has the brand marquee. Decide
  whether to add it back.
- **Second WhatsApp number.** Live site uses `+62895364547187` (main) and
  `+6287888527772` (join) and `+6285797132658` (violation admin). The rebuilt
  site standardises on `+62895364547187` except `/pelanggaran` which keeps
  `+6285797132658` for admin confirmation.
- **"Our Services" / "Support" nav.** Old nav pointed these at
  `https://picnic.web.id/`. The new nav is About / Creators / For brands.
  PRD §15 open question: is `picnic.web.id` staying separate? If it should be
  linked, add it to `site-nav.tsx`.
- **`<title>`.** Old: "Picnic Club – More Than an Agency - Picnic Club Agency".
  New homepage title set to "Picnic Club — More Than an Agency" to preserve
  search intent.

## 3. Cutover verification (done)

Checked against Vercel (forced-resolve to `76.76.21.21`) right after the cert
issued:

- [x] `npm run db:backup` snapshots taken before and after.
- [x] Valid TLS cert, `CN=picnicclub.id`.
- [x] `/`, `/members`, `/@inproduk`, `/pelanggaran`, `/privacy`, `/terms`,
      `/affiliate-disclosure`, `/report` → 200.
- [x] `/sample-page` → 301 → `/`; `/wp-admin` → 301 → `/admin`;
      `/category/uncategorized` → 301 → `/members`; old sitemaps → `/sitemap.xml`.
- [x] `www.picnicclub.id` → 308 → `https://picnicclub.id/`.
- [x] `/sitemap.xml`, `/robots.txt` serve correctly.
- [x] Images load from Supabase Storage (no `wp-content` references anywhere).
- [x] `npm run test:e2e` (11 E2E + axe) and `npm test` (11 unit) green pre-push.

## 4. Remaining owner tasks (browser-only)

- [ ] Re-enable **Theft Protection** in Berdu → `picnicclub.id` → EPP tab.
- [ ] **Google Search Console**: add `https://picnicclub.id` property, verify
      (HTML tag or Cloudflare DNS TXT), submit `sitemap.xml`. No "Change of
      Address" — the domain itself did not change.
- [ ] Team sign-off on the content-audit items in §2 (edit copy/FAQ/founders
      via `/superadmin`).

## 5. Post-launch (first 2 weeks)

- Watch Search Console Coverage + Crawl stats for new 404s.
- Watch Vercel runtime logs/errors and Supabase logs (no external monitoring
  by design — see the error-monitoring note).
- Keep WordPress **online but frozen** at `103.139.175.28` until Search Console
  shows the new URLs indexed and redirects verified. Only then decommission.
- Schedule `npm run db:backup` (or a Supabase scheduled backup).

## 6. Follow-ups (not required for launch)

- Add uptime monitoring against `https://picnicclub.id`.
- Decide the fate of `picnic.web.id` (old nav "Our Services" / "Support").
- The dormant `LEGACY_MEDIA_ORIGIN` rewrite in `next.config.ts` can be removed
  once you're sure no stale `wp-content` URL exists.
