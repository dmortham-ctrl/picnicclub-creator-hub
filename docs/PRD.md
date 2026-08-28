# Product Requirements Document

## Picnic Club Creator Hub

**Status:** Draft for product and technical alignment  
**Date:** 28 August 2026  
**Owner:** Picnic Club  
**Target domain:** `picnicclub.id`  
**Migration:** WordPress hosting to Next.js on Vercel

## 1. Ringkasan

Picnic Club akan bertransformasi dari website profil MCN/agency berbasis WordPress menjadi **creator hub**: website utama Picnic Club sekaligus kumpulan minisite publik untuk para anggota affiliate dan content creator.

Homepage tetap mempertahankan identitas dan struktur hero saat ini, termasuk avatar-avatar affiliate teratas. Perubahan utama adalah setiap anggota yang disetujui dapat memiliki halaman link-in-bio yang mudah dibagikan, misalnya `picnicclub.id/@username`, berisi profil, tautan sosial, tautan produk/affiliate, dan CTA pilihan.

PRD ini mendefinisikan produk, MVP, batasan scope, kebutuhan teknis, migrasi, dan kriteria penerimaan. Dokumen ini bukan instruksi untuk langsung membangun fitur.

## 2. Latar Belakang Dan Masalah

Website saat ini efektif sebagai profil agency, tetapi belum:

- Menjadi pintu masuk terpusat untuk menemukan anggota Picnic Club.
- Memberi anggota satu halaman profesional untuk mengumpulkan seluruh link mereka.
- Menyediakan cara terstruktur bagi admin untuk mengelola profil dan tautan anggota.
- Menyediakan data dasar tentang klik link dan performa minisite.
- Memisahkan konten bisnis/marketing dari platform publishing WordPress.

## 3. Tujuan

### Tujuan utama

- Memindahkan website publik ke Next.js di Vercel tanpa kehilangan SEO, konten penting, dan identitas visual yang sudah dikenal.
- Mempertahankan hero homepage dan avatar affiliate unggulan sebagai elemen brand utama.
- Menyediakan minisite link-in-bio publik untuk anggota yang disetujui.
- Memungkinkan admin mengelola anggota, profil, tautan, urutan tampilan, dan status publikasi tanpa perubahan kode.
- Mengukur kunjungan dan klik CTA/link secara privacy-conscious.

### Indikator keberhasilan awal

- 100% URL WordPress penting memiliki redirect atau halaman pengganti yang relevan.
- Homepage dapat dipublikasikan tanpa regresi visual pada hero dan section avatar.
- Admin dapat membuat, mengedit, menonaktifkan, dan menerbitkan minisite anggota.
- Anggota dapat membagikan URL minisite yang stabil dan mobile-friendly.
- Core Web Vitals dan Lighthouse mobile berada pada tingkat yang layak untuk landing page publik, dengan target awal Performance >= 90 bila realistis setelah aset dioptimalkan.
- Event klik CTA dan link tercatat dengan benar tanpa menyimpan data pribadi yang tidak diperlukan.

### Bukan tujuan MVP

- Marketplace produk atau checkout di dalam Picnic Club.
- Sistem komisi, payout, atau rekonsiliasi keuangan.
- Social feed atau messaging antaranggota.
- Dashboard GMV real-time dari TikTok/Shopee.
- Penggantian penuh Google Forms, WhatsApp, atau sistem operasional MCN.
- Self-service signup anggota tanpa proses approval admin.

## 4. Pengguna Dan Peran

### Pengunjung publik

Ingin memahami Picnic Club, melihat creator unggulan, menemukan minisite anggota, dan membuka link sosial/produk.

### Anggota creator

Ingin memiliki halaman profil ringkas yang profesional, mudah dibagikan, dan berisi semua link penting.

### Admin Picnic Club

Ingin mengelola konten homepage dan minisite tanpa developer, meninjau data dasar, serta mengontrol profil yang tampil publik.

### Brand atau seller

Ingin memahami kredibilitas Picnic Club dan menghubungi tim untuk kolaborasi.

## 5. Ruang Lingkup MVP

### 5.1 Homepage

Homepage mempertahankan section hero saat ini secara visual dan pesan utama, dengan penyempurnaan responsif bila dibutuhkan:

- Navigation: Home, About Us, Our Services, Support, Contact Us.
- Hero utama dengan positioning Picnic Club sebagai komunitas/creator commerce ecosystem.
- CTA `Join as Creator` dan `Collaborate With Us`.
- Avatar affiliate teratas dalam layout yang menonjol; setiap avatar dapat mengarah ke minisite anggota bila profilnya tersedia.
- Partner platform dan brand yang pernah bekerja sama.
- Statistik utama, dengan sumber data dan tanggal pembaruan yang jelas.
- Section untuk creator dan brand.
- About, benefit, syarat bergabung, FAQ, founder, dan footer dari konten WordPress yang telah diaudit.
- CTA WhatsApp/form tetap dipertahankan pada MVP.

Konten dan aset lama tidak boleh diasumsikan semuanya dipindahkan otomatis. Admin perlu menyetujui copy, angka, logo, foto, dan link sebelum launch.

### 5.2 Direktori anggota

Route: `/members`

- Menampilkan anggota yang statusnya `published`.
- Kartu berisi avatar, display name, username, kategori/niche, dan CTA `View profile`.
- Search berdasarkan nama/username.
- Filter kategori/niche jika jumlah anggota sudah cukup untuk membutuhkannya.
- Pagination atau infinite loading tidak wajib pada versi pertama; gunakan pagination bila jumlah data besar.
- Profil nonaktif, draft, atau suspended tidak boleh muncul di halaman publik atau hasil pencarian.

### 5.3 Minisite link-in-bio anggota

Route canonical: `/@username`

Halaman publik harus:

- Menampilkan avatar, display name, username, bio singkat, niche, dan badge/status opsional.
- Menampilkan link dalam urutan yang ditentukan admin/anggota.
- Mendukung tipe link: URL eksternal, TikTok, Instagram, YouTube, WhatsApp, Shopee, TikTok Shop, marketplace, dan email.
- Menampilkan label, URL tujuan, ikon platform, dan status aktif/nonaktif.
- Menyediakan CTA yang mudah disentuh di mobile.
- Menyediakan Open Graph/Twitter metadata dengan foto dan nama anggota.
- Menampilkan disclosure sederhana bila link merupakan link affiliate atau berbayar, sesuai kebijakan Picnic Club.
- Membuka link eksternal dengan keamanan yang sesuai dan tidak mengizinkan HTML/script bebas dari input pengguna.

URL username harus unik, case-insensitive, tidak boleh memakai reserved words seperti `admin`, `members`, `about`, `support`, dan tidak boleh berubah tanpa proses migrasi/redirect.

### 5.4 Admin CMS

Route admin tidak perlu publik dan harus membutuhkan autentikasi.

Admin dapat:

- Login dan logout.
- Membuat/edit profil anggota.
- Mengatur username, nama tampilan, bio, avatar, kategori, social handles, dan status.
- Menambah, mengedit, mengurutkan, menonaktifkan, dan menghapus link.
- Menentukan featured/top affiliate untuk tampil di homepage.
- Menentukan urutan avatar featured.
- Mengatur konten homepage yang berubah berkala: statistik, brand, partner, CTA, FAQ, dan founder.
- Preview profil sebelum publish.
- Publish, unpublish, atau suspend profil.
- Melihat ringkasan views dan clicks per profil/link untuk rentang tanggal.

Untuk MVP, role cukup `admin`; role editor/creator dapat ditambahkan setelah alur operasional stabil.

### 5.5 Analytics dasar

Event minimum:

- `page_view` homepage, direktori, dan minisite.
- `profile_view` per anggota.
- `link_click` dengan profile ID dan link ID.
- `cta_click` untuk Join, Collaborate, WhatsApp, dan form.

Dashboard hanya menampilkan agregasi dasar: views, unique visitors secara agregat bila tool mendukung, clicks, CTR, top links, dan periode. Jangan menyimpan data sensitif atau query string affiliate mentah jika tidak dibutuhkan.

## 6. User Flow Utama

### Pengunjung menemukan creator

1. Pengunjung membuka homepage.
2. Melihat hero dan avatar affiliate unggulan.
3. Memilih avatar atau membuka `Members`.
4. Mencari/filter anggota.
5. Membuka minisite anggota.
6. Menekan link sosial, produk, atau CTA.

### Admin menerbitkan minisite

1. Admin login.
2. Membuat profil anggota atau memilih draft.
3. Mengunggah avatar dan mengisi identitas/bio.
4. Menambahkan dan mengurutkan link.
5. Preview halaman mobile/desktop.
6. Publish.
7. Menandai anggota sebagai featured bila diperlukan.

### Anggota mendaftar

1. Pengunjung menekan `Join as Creator`.
2. Pengunjung menyelesaikan form yang sudah berjalan.
3. Tim Picnic Club melakukan verifikasi di luar aplikasi.
4. Admin membuat/menerbitkan minisite setelah disetujui.

## 7. Kebutuhan Fungsional

- Semua halaman publik harus dapat diakses tanpa login.
- Profil hanya bisa tampil publik jika statusnya `published` dan lolos validasi minimum.
- Link invalid, kosong, atau berbahaya tidak dapat disimpan/dipublikasikan.
- Admin dapat mengembalikan profil ke draft tanpa menghapus datanya.
- Gambar dioptimalkan, memiliki alt text, dan memiliki fallback avatar.
- Konten teks mendukung Bahasa Indonesia; copy bahasa Inggris hanya dipakai bila memang bagian brand.
- Error state, empty state, loading state, dan 404 harus tersedia.
- Admin menerima konfirmasi sebelum tindakan destruktif.
- Link eksternal menggunakan redirect/tracking internal hanya jika keputusan analytics sudah disetujui; bila dipakai, redirect harus tetap cepat dan transparan.

## 8. Non-Functional Requirements

### Performance

- Gunakan static generation/ISR untuk homepage, direktori, dan minisite yang dipublikasikan.
- Optimalkan foto avatar dan logo; hindari memuat gambar WordPress berukuran besar langsung.
- Target LCP < 2.5 detik pada koneksi 4G untuk halaman publik utama.
- Hindari JavaScript client-side yang tidak diperlukan.

### SEO

- Pertahankan title, description, canonical, sitemap, robots, Open Graph, dan structured data yang relevan.
- Buat redirect 301 dari URL WordPress yang memiliki nilai SEO.
- Pertahankan atau petakan slug artikel/halaman penting.
- Jangan index draft, halaman admin, atau profil suspended.

### Accessibility

- Target WCAG 2.2 AA untuk kontras, keyboard navigation, focus state, label, alt text, dan semantic headings.
- Semua CTA/link harus dapat dipahami tanpa hanya mengandalkan warna atau ikon.

### Security And Privacy

- Admin memakai provider auth yang aman, session expiry, dan proteksi route.
- Validasi URL di server; sanitasi seluruh input; tidak ada arbitrary HTML/JavaScript dari admin atau anggota pada MVP.
- Rate limit login dan endpoint publik yang sensitif.
- Rahasia dan credential hanya di environment variables Vercel.
- Sediakan Privacy Policy, Terms, affiliate disclosure, dan halaman pelaporan pelanggaran.
- Tentukan kebijakan penghapusan akun/profil dan data analytics sebelum launch.

### Reliability

- Preview deployment untuk setiap pull request.
- Production deployment melalui branch terlindungi dan pemeriksaan build.
- Backup database dan media dengan prosedur restore yang diuji.
- Error monitoring dan uptime monitoring aktif sebelum launch.

## 9. Rekomendasi Tech Stack

Stack final dikunci setelah discovery dan keputusan volume/data, tetapi baseline yang direkomendasikan:

- **Framework:** Next.js terbaru yang stabil, App Router, TypeScript.
- **Hosting/deployment:** Vercel, Preview/Production environments, custom domain `picnicclub.id`.
- **Styling/UI:** Tailwind CSS dengan komponen UI minimal yang mengikuti visual website saat ini; jangan mengganti hero tanpa approval desain.
- **Content/data:** Supabase PostgreSQL untuk profil, link, status, urutan, dan analytics agregat.
- **Auth:** Supabase Auth untuk admin pada MVP; akses dibatasi melalui allowlist admin.
- **Media:** Supabase Storage atau Vercel Blob; pilih satu sebagai source of truth, bukan campuran tanpa aturan.
- **Validation:** Zod pada boundary API/form.
- **Forms:** Pertahankan Google Forms/WhatsApp pada MVP; integrasi form native dapat menjadi fase berikutnya.
- **Analytics:** PostHog atau Vercel Web Analytics plus event custom; pilih satu primary analytics tool untuk menghindari data terpecah.
- **Monitoring:** Sentry untuk error monitoring dan Vercel logs.
- **Testing:** Vitest untuk unit, Playwright untuk critical user flows, dan Lighthouse/axe pada CI bila memungkinkan.

Alternatif headless CMS seperti Sanity atau Payload layak dipertimbangkan jika kebutuhan editorial homepage menjadi dominan. Untuk MVP yang terutama berisi data terstruktur anggota dan link, Supabase mengurangi jumlah sistem yang perlu dioperasikan.

## 10. Model Data Minimum

### `profiles`

`id`, `username`, `display_name`, `bio`, `avatar_url`, `category`, `social_handles`, `status`, `is_featured`, `featured_order`, `created_at`, `updated_at`, `published_at`.

### `profile_links`

`id`, `profile_id`, `label`, `url`, `link_type`, `icon_key`, `sort_order`, `is_active`, `affiliate_disclosure`, `created_at`, `updated_at`.

### `homepage_content`

Key/value atau struktur ter-versioning untuk copy, stats, partner, brand, founder, FAQ, CTA, dan setting avatar featured.

### `analytics_events`

Hanya bila analytics tidak sepenuhnya dikelola provider eksternal: `id`, `event_name`, `profile_id`, `link_id`, `occurred_at`, dan metadata agregat/non-identifying yang telah disetujui.

## 11. Migrasi WordPress Ke Next.js

### Audit sebelum implementasi

- Inventaris seluruh page, post, media, redirect, metadata, dan URL yang diindeks.
- Kelompokkan konten: wajib dipindah, ditulis ulang, diarsipkan, atau dibuang.
- Validasi seluruh nomor statistik, klaim partner, logo brand, foto, dan CTA.
- Pastikan hak penggunaan foto anggota, logo, dan aset pihak ketiga.

### Strategi migrasi

1. Freeze perubahan konten WordPress pada window yang disepakati.
2. Export konten dan media yang disetujui.
3. Bersihkan dan kompres aset; beri nama file dan alt text yang konsisten.
4. Mapping URL lama ke URL Next.js.
5. Uji redirect, metadata, sitemap, form, WhatsApp, dan link eksternal.
6. Deploy ke Vercel dengan domain sementara untuk QA.
7. Cut over DNS setelah sign-off.
8. Pantau 404, Search Console, analytics, dan error log setelah launch.

WordPress tidak langsung dimatikan sampai data, redirect, dan backup final tervalidasi.

## 12. Acceptance Criteria MVP

- Homepage production mempertahankan hero dan section avatar top affiliate sesuai desain yang disetujui pada desktop dan mobile.
- Setiap avatar featured yang memiliki profil aktif mengarah ke URL minisite yang benar.
- Admin dapat membuat dan publish profil tanpa edit kode.
- Profil published dapat dibuka melalui `/@username`, memiliki metadata share, dan tampil baik di mobile.
- Link dapat diurutkan, dinonaktifkan, dan aman divalidasi.
- Profil draft/unpublished/suspended tidak dapat diakses sebagai halaman publik dan tidak terindex.
- `Members` mendukung pencarian dan hanya menampilkan profil yang boleh tampil.
- CTA existing untuk Join, Collaborate, WhatsApp, dan form berfungsi.
- URL SEO penting dari WordPress memiliki redirect atau keputusan migrasi terdokumentasi.
- Analytics mencatat page/profile/link/CTA events dalam environment production.
- Build, lint, unit test, critical E2E flow, accessibility smoke test, dan responsive QA lulus sebelum launch.
- Privacy Policy, Terms, affiliate disclosure, dan halaman support/pelanggaran tersedia.

## 13. Fase Pengembangan

### Fase 0: Discovery Dan Content Audit

Finalisasi sitemap, inventory URL, visual baseline, hak aset, data anggota awal, aturan approval, dan definisi statistik.

### Fase 1: MVP Creator Hub

Migrasi homepage, direktori, minisite publik, admin CRUD, media upload, basic analytics, SEO, dan deployment Vercel.

### Fase 2: Self-Service Creator

Login anggota, anggota mengedit profil/link sendiri, approval workflow, template tema terbatas, dan import social links.

### Fase 3: Creator Growth Platform

Analytics per anggota yang lebih lengkap, campaign/brand opportunities, resource hub, newsletter, dan integrasi platform bila API serta kebutuhan bisnis sudah jelas.

### Fase 4: Monetization And Ecosystem

Pertimbangkan lead management brand, campaign tracking, affiliate link management, dan payout/reporting. Fase ini memerlukan legal, finance, serta integrasi platform yang terpisah.

## 14. Risiko Dan Mitigasi

- **Aset WordPress tidak konsisten atau terlalu besar:** audit hak penggunaan, resize/compress, dan gunakan image optimization.
- **Perubahan hero dianggap menghilangkan identitas brand:** jadikan hero dan avatar sebagai visual regression checkpoint serta minta approval eksplisit.
- **Data anggota tidak terkurasi:** gunakan status draft/published/suspended dan approval admin.
- **Link affiliate berubah atau rusak:** health check berkala dan kemampuan edit cepat dari admin.
- **Ketergantungan API TikTok/Shopee:** jangan jadikan integrasi platform sebagai dependency MVP.
- **Klaim statistik/brand sudah tidak aktual:** tampilkan last updated dan owner konten.
- **Spam atau link berbahaya:** validasi scheme/domain, rate limit, sanitasi, dan moderasi.
- **SEO turun saat cutover:** URL mapping, 301, sitemap, Search Console monitoring, dan rollback plan.
- **Scope melebar menjadi platform penuh:** gunakan fase dan acceptance criteria di atas sebagai batas release.

## 15. Keputusan Yang Masih Dibutuhkan

- Apakah URL publik final menggunakan `/@username`, `/member/username`, atau subdomain `username.picnicclub.id`? Rekomendasi MVP: `/@username`.
- Apakah anggota boleh mengedit minisite sendiri sejak MVP, atau semua perubahan melalui admin? Rekomendasi: admin-only dulu.
- Berapa jumlah anggota awal yang akan dimigrasikan dan siapa yang masuk daftar featured?
- Apakah minisite perlu tema visual per anggota atau satu brand template pada MVP? Rekomendasi: satu template dengan opsi warna terbatas setelah validasi.
- Tool analytics utama mana yang disetujui dan bagaimana kebijakan cookie/consent-nya?
- Siapa owner konten untuk statistik, partner, brand, FAQ, legal, dan link CTA?
- Apakah `picnic.web.id` tetap menjadi tujuan `Our Services` atau ikut dimigrasikan?
- Domain/email apa saja yang perlu dipindahkan atau dipertahankan di luar website?
- Target launch, budget operasional, dan SLA support setelah cutover?

## 16. Definition Of Ready Untuk Build

Build baru dimulai setelah keputusan berikut tersedia:

- Sitemap dan route final disetujui.
- Hero, avatar featured, dan baseline visual disetujui.
- Daftar anggota awal beserta consent dan aset tersedia.
- Content/URL migration mapping selesai.
- Pemilik keputusan admin, konten, legal, dan teknis ditunjuk.
- Provider database, auth, media, analytics, dan monitoring disetujui.
- Acceptance criteria dan target launch disepakati.
