create extension if not exists pgcrypto;

create type public.profile_status as enum ('draft', 'published', 'suspended');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  username text not null unique check (username = lower(username) and username ~ '^[a-z0-9._-]+$'),
  display_name text not null,
  bio text not null default '',
  avatar_url text not null default '',
  category text not null default 'Lifestyle',
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
create policy "authenticated admins manage profiles" on public.profiles for all to authenticated using ((auth.jwt()->'app_metadata'->>'is_admin') = 'true') with check ((auth.jwt()->'app_metadata'->>'is_admin') = 'true');
create policy "authenticated admins manage links" on public.profile_links for all to authenticated using ((auth.jwt()->'app_metadata'->>'is_admin') = 'true') with check ((auth.jwt()->'app_metadata'->>'is_admin') = 'true');

create index profiles_published_order on public.profiles(status, is_featured, featured_order);
create index profile_links_profile_order on public.profile_links(profile_id, sort_order);
