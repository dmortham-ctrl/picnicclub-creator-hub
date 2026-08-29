# WordPress → Next.js Migration Runbook

Status: **prepared, not yet executed.** Cutover needs a Vercel deployment,
DNS access, and content sign-off from the Picnic Club team.

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

## 3. Pre-cutover checklist

- [ ] Content audit above signed off by the team.
- [x] **Media** moved to Supabase Storage (§2a).
- [ ] `npm run db:backup` — fresh data snapshot right before cutover.
- [ ] Verify Supabase RLS with a non-admin creator account end to end.
- [ ] Deploy to a Vercel **preview / temporary domain**. Set
      `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in
      Production + Preview.
- [ ] QA on the temp domain:
  - [ ] `/`, `/members`, `/@<username>`, `/admin`, `/superadmin`, `/pelanggaran`,
        `/privacy`, `/terms`, `/affiliate-disclosure`, `/report`
  - [ ] Redirects: hit `/sample-page`, `/feed/`, `/wp-sitemap.xml`,
        `/category/uncategorized/`, `/wp-admin` → expect 301 to the mapped URL
  - [ ] A real `/wp-content/uploads/...` image URL still returns the image
  - [ ] `/sitemap.xml` and `/robots.txt` correct, draft/suspended profiles
        excluded and `noindex`
  - [ ] OG/Twitter cards render (paste a `/@username` URL into a link preview)
  - [ ] Google Forms + WhatsApp links open correctly
  - [ ] Analytics events land (`/superadmin#analytics` shows traffic)
  - [ ] Mobile + `npm run test:e2e` (includes axe) green
  - [ ] Lighthouse mobile ≥ 90 on `/`

## 4. Cutover

1. Freeze WordPress content edits.
2. Add `picnicclub.id` (and `www`) as domains on the Vercel project.
3. Update DNS per Vercel's instructions (A / CNAME). Lower TTL a day before.
4. Wait for propagation + TLS certificate.
5. In Supabase → Authentication → URL Configuration, set Site URL to
   `https://picnicclub.id` and add redirect URL `https://picnicclub.id/admin`.
6. Smoke-test production immediately (checklist in §3).
7. Submit `https://picnicclub.id/sitemap.xml` in Google Search Console;
   use "Change of Address" only if the domain itself changes (it does not).

## 5. Post-launch (first 2 weeks)

- Watch Search Console Coverage + Crawl stats for new 404s.
- Watch Vercel runtime logs/errors and Supabase logs (no external monitoring
  by design — see the error-monitoring note).
- Keep WordPress **online but frozen** until Search Console shows the new URLs
  indexed and redirects verified. Only then decommission.
- Schedule `npm run db:backup` (or a Supabase scheduled backup).

## 6. Rollback

Because DNS is the switch, rollback = point DNS back at the WordPress host.
Keep the old A/CNAME records noted before changing them. Supabase data is
unaffected by a rollback.

## 7. Follow-ups (not required for launch)

- If the proxy safety net (§2a option 2) was used, finish moving media into
  Supabase Storage and remove `LEGACY_MEDIA_ORIGIN`.
- Add uptime monitoring against the production URL.
- Decide the fate of `picnic.web.id`.
