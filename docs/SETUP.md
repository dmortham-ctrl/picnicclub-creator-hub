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

1. Buka Supabase Dashboard.
2. Pilih `SQL Editor`.
3. Jalankan seluruh isi `supabase/schema.sql`.
4. Buat user admin di `Authentication > Users`.
5. Set `app_metadata.is_admin` menjadi `true` untuk user admin melalui Supabase service role/API yang aman. Jangan expose service role key di browser atau commit ke repository.

Contoh payload metadata:

```json
{
  "is_admin": true
}
```

RLS hanya mengizinkan user authenticated dengan metadata tersebut untuk insert/update/delete profile dan link. Public hanya dapat membaca profile `published` serta link yang aktif.

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

## Current MVP boundaries

- Homepage, directory, dan public minisite sudah tersedia.
- Supabase public read dan admin auth/create profile sudah tersedia.
- Edit/delete profile, link management UI, media upload, click analytics, dan WordPress content migration masih merupakan pekerjaan lanjutan sebelum production launch.
