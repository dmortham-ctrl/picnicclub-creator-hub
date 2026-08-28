create extension if not exists pgcrypto;

create type public.profile_status as enum ('draft', 'published', 'suspended');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  username text not null unique check (username = lower(username) and username ~ '^[a-z0-9._-]+$'),
  display_name text not null,
  bio text not null default '',
  avatar_url text not null default '',
  category text not null default 'Lifestyle',
  level text not null default 'Rising' check (level in ('All Star', 'Featured', 'Rising')),
  status public.profile_status not null default 'draft',
  is_featured boolean not null default false,
  featured_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table public.profile_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  url text not null check (url ~* '^https?://'),
  link_type text not null default 'link',
  icon_key text not null default 'link',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  affiliate_disclosure boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.profile_links enable row level security;
create policy "published profiles are public" on public.profiles for select using (status = 'published');
create policy "active links of published profiles are public" on public.profile_links for select using (is_active and exists (select 1 from public.profiles where id = profile_id and status = 'published'));
create policy "authenticated admins manage profiles" on public.profiles for all to authenticated using ((auth.jwt()->>'email') = 'dmortham@gmail.com') with check ((auth.jwt()->>'email') = 'dmortham@gmail.com');
create policy "authenticated admins manage links" on public.profile_links for all to authenticated using ((auth.jwt()->>'email') = 'dmortham@gmail.com') with check ((auth.jwt()->>'email') = 'dmortham@gmail.com');

create index profiles_published_order on public.profiles(status, is_featured, featured_order);
create index profile_links_profile_order on public.profile_links(profile_id, sort_order);
create index profiles_owner_id on public.profiles(owner_id);

create table public.site_content (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;
create policy "public can read site content" on public.site_content for select using (true);
create policy "admins manage site content" on public.site_content for all to authenticated using ((auth.jwt()->>'email') = 'dmortham@gmail.com') with check ((auth.jwt()->>'email') = 'dmortham@gmail.com');

insert into public.site_content (key, value) values
  ('hero_title', 'More than an agency.'),
  ('hero_description', 'Rumah bagi para creator dan affiliator terbaik Indonesia. Grow your influence, income, and network together.'),
  ('marquee_text', 'Indonesia''s largest affiliate community'),
  ('about_title', 'We make creator growth feel less lonely.'),
  ('brands_title', 'Brands we''ve worked with.'),
  ('faq_intro', 'Masih ingin tahu lebih banyak? Tim Picnic Club siap membantu.')
on conflict (key) do nothing;

insert into storage.buckets (id, name, public)
values ('Avatar', 'Avatar', true)
on conflict (id) do nothing;

create policy "public can view avatars" on storage.objects for select using (bucket_id = 'Avatar');
create policy "admins can upload avatars" on storage.objects for insert to authenticated with check (bucket_id = 'Avatar' and (auth.jwt()->>'email') = 'dmortham@gmail.com');
create policy "admins can update avatars" on storage.objects for update to authenticated using (bucket_id = 'Avatar' and (auth.jwt()->>'email') = 'dmortham@gmail.com') with check (bucket_id = 'Avatar' and (auth.jwt()->>'email') = 'dmortham@gmail.com');
create policy "admins can delete avatars" on storage.objects for delete to authenticated using (bucket_id = 'Avatar' and (auth.jwt()->>'email') = 'dmortham@gmail.com');
