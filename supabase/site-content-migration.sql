create table if not exists public.site_content (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

drop policy if exists "public can read site content" on public.site_content;
create policy "public can read site content" on public.site_content for select using (true);

drop policy if exists "admins manage site content" on public.site_content;
create policy "admins manage site content" on public.site_content for all to authenticated using ((auth.jwt()->>'email') = 'dmortham@gmail.com') with check ((auth.jwt()->>'email') = 'dmortham@gmail.com');

insert into public.site_content (key, value) values
  ('hero_title', 'More than an agency.'),
  ('hero_description', 'Rumah bagi para creator dan affiliator terbaik Indonesia. Grow your influence, income, and network together.'),
  ('marquee_text', 'Indonesia''s largest affiliate community'),
  ('about_title', 'We make creator growth feel less lonely.'),
  ('brands_title', 'Brands we''ve worked with.'),
  ('faq_intro', 'Masih ingin tahu lebih banyak? Tim Picnic Club siap membantu.')
on conflict (key) do nothing;
