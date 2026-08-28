-- Phase 1: privacy-conscious analytics, FAQ content, founder selection,
-- and a few more reserved route names.

-- ---------------------------------------------------------------------------
-- 1. analytics_events  (no PII, no raw affiliate query strings)
-- ---------------------------------------------------------------------------

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  event_name text not null check (event_name in ('page_view', 'profile_view', 'link_click', 'cta_click')),
  path text,
  profile_id uuid references public.profiles(id) on delete set null,
  link_id uuid references public.profile_links(id) on delete set null,
  cta_key text,
  referrer_host text,
  occurred_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;

drop policy if exists "anyone can record an event" on public.analytics_events;
create policy "anyone can record an event"
  on public.analytics_events for insert to anon, authenticated with check (true);

drop policy if exists "admins read events" on public.analytics_events;
create policy "admins read events"
  on public.analytics_events for select to authenticated using (public.is_admin());

create index if not exists analytics_events_name_time on public.analytics_events (event_name, occurred_at desc);
create index if not exists analytics_events_profile_time on public.analytics_events (profile_id, occurred_at desc);
create index if not exists analytics_events_link_time on public.analytics_events (link_id, occurred_at desc);

-- ---------------------------------------------------------------------------
-- 2. faqs
-- ---------------------------------------------------------------------------

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.faqs enable row level security;

drop policy if exists "faqs readable when active or by admin" on public.faqs;
create policy "faqs readable when active or by admin"
  on public.faqs for select using (is_active or public.is_admin());

drop policy if exists "admins manage faqs" on public.faqs;
create policy "admins manage faqs"
  on public.faqs for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.faqs (question, answer, sort_order)
select * from (values
  ('Apa Itu Picnic Club?', 'Picnic Club adalah MCN dan komunitas creator commerce yang dibangun oleh praktisi content creation dan affiliate marketing. Kami membantu creator dan affiliator bertumbuh melalui edukasi, mentoring, networking, akses campaign, dan kolaborasi dengan brand.', 1),
  ('Penting Gak Ikut MCN/Agency?', 'Bergabung dengan MCN membantu creator mendapatkan akses yang biasanya sulit didapatkan sendiri, seperti voucher dan promo platform, dukungan iklan, event matchmaking, pendampingan, bantuan pelanggaran akun, serta komunitas untuk belajar dan berkembang.', 2),
  ('Benefit apa Join Picnic Club?', 'Member mendapatkan training online rutin, Zoom materi dan tips, chat support dengan mentor, networking dan kopdar, reward dan trip, peluang support iklan, update hook dan ide konten, akses ruang konten, sample produk, serta support manager.', 3),
  ('Apa Syarat Join Picnic Club?', 'Syarat utama: memiliki akun TikTok dengan minimal 600 followers, GMV minimal Rp1.000.000, berusia minimal 18 tahun, berdomisili di Indonesia, aktif membuat konten atau live, bersedia belajar, konsisten, kreatif, dan mematuhi kebijakan platform.', 4),
  ('Berapa Potongan Fee Picnic Club?', 'Picnic Club berkomitmen memberikan potongan fee yang kompetitif. Detail sharing fee dan mekanismenya akan dijelaskan oleh admin sesuai platform dan program yang diikuti.', 5),
  ('Gimana cara Join?', 'Hubungi admin Picnic Club melalui WhatsApp, kemudian isi formulir pendaftaran TikTok atau Shopee. Tim kami akan memandu proses verifikasi, penautan akun, dan mekanisme sharing fee.', 6)
) as seed(question, answer, sort_order)
where not exists (select 1 from public.faqs);

-- ---------------------------------------------------------------------------
-- 3. Founder selection (ordered list of usernames on the homepage)
-- ---------------------------------------------------------------------------

insert into public.site_content (key, value) values
  ('founder_usernames', 'inproduk,bertosb1m,adli.hibatul,aditsur88,sobatkaryawan')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- 4. Extend reserved usernames with new route names
-- ---------------------------------------------------------------------------

alter table public.profiles drop constraint if exists profiles_username_not_reserved;
alter table public.profiles add constraint profiles_username_not_reserved check (
  username !~ '^(admin|superadmin|administrator|userpanel|user|users|members|member|about|support|contact|help|api|auth|login|logout|signin|signup|register|dashboard|settings|account|profile|profiles|brands|brand|faq|privacy|terms|legal|report|reports|disclosure|static|assets|public|www|mail|blog|news|home|index|null|undefined|next|_next|vercel|supabase|picnic|picnicclub|l|r|go|track|sitemap|robots)$'
);
