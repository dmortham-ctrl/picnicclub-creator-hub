# Local And Supabase Setup

## 1. Install and run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Isi `.env.local` dengan `Project URL` dan `anon public key` dari Supabase.

Tanpa env Supabase, halaman publik menggunakan demo data agar UI tetap bisa direview. Data demo tidak boleh dipakai untuk production.

## 2. Create the database

### Fresh project

1. Buka Supabase Dashboard > `SQL Editor`.
2. Jalankan seluruh isi `supabase/schema.sql`.
3. Buat user admin di `Authentication > Users` (atau login lewat `/admin`).
4. Jadikan user itu admin:

   ```sql
   insert into public.admins (user_id, note)
   select id, 'founder' from auth.users where email = 'you@example.com';
   ```

### Existing project

Jalankan file di `supabase/migrations/` berurutan (nama file = timestamp). Untuk
project ini yang belum punya tabel `admins`, jalankan
`supabase/migrations/20260829090000_phase0_roles_and_rls.sql`, lalu tambahkan
admin dengan query di atas.

Dengan Supabase CLI: `supabase link --project-ref <ref>` lalu `supabase db push`.

### Model akses

- Publik hanya membaca profile `published` dan link aktifnya.
- Creator authenticated mengelola **hanya** profile miliknya sendiri
  (`owner_id = auth.uid()`) beserta linknya.
- `is_featured`, `featured_order`, dan `level` hanya bisa diubah admin.
- Admin (`public.admins`) mengelola semua profile, link, brand, dan site content.
- `/userpanel` dan `/superadmin` dijaga di `middleware.ts`; `/superadmin`
  memanggil RPC `is_admin()`.

## 3. Configure magic link

Di `Authentication > URL Configuration`, tambahkan:

- Site URL: `http://localhost:3000` untuk local development.
- Redirect URL: `http://localhost:3000/admin`.
- Saat production, tambahkan `https://picnicclub.id` dan `https://picnicclub.id/admin`.

## 4. Add initial content

MVP saat ini menyediakan admin create-profile dasar. Link dapat dimasukkan melalui SQL Editor sampai UI link management selesai.

```sql
insert into public.profile_links
  (profile_id, label, url, link_type, icon_key, sort_order, affiliate_disclosure)
values
  ('PROFILE_UUID', 'Follow me on TikTok', 'https://www.tiktok.com/@username', 'tiktok', 'tiktok', 1, false);
```

Setelah profil siap ditampilkan:

```sql
update public.profiles
set status = 'published', published_at = now()
where username = 'username';
```

## 5. Deployment to Vercel

1. Import repository ke Vercel.
2. Set `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` di Production dan Preview environment.
3. Deploy preview dan QA route `/`, `/members`, `/@username`, dan `/admin`.
4. Tambahkan domain `picnicclub.id` di Vercel dan arahkan DNS sesuai instruksi Vercel.
5. Update Supabase Site URL dan redirect URL ke domain production.

## Current status

Fase 0 dan sebagian besar Fase 1 sudah jalan:

- Homepage, directory, dan minisite `/@username` (SSG/ISR + Open Graph + JSON-LD).
- Role model owner-based + admin allowlist, route diproteksi middleware.
- Validasi input Zod + reserved username (client + DB constraint).
- Link management lengkap di `/userpanel` (edit, urutkan, aktif/nonaktif, tipe + ikon).
- Analytics: tabel `analytics_events`, endpoint `/api/track`, redirect `/l/[id]`,
  dashboard agregat di `/superadmin`.
- SEO: `sitemap.xml`, `robots.txt`, canonical, structured data.
- Halaman legal (`/privacy`, `/terms`, `/affiliate-disclosure`, `/report`) - masih draf.
- CMS: editor FAQ, kontrol founder, filter kategori di direktori.

Belum: media pakai `next/image` + migrasi avatar ke Storage, aksesibilitas
audit, testing (Vitest/Playwright), monitoring (Sentry), rate limiting,
dan migrasi konten WordPress. Lihat roadmap Fase 1 sisa + Fase 1.5.
