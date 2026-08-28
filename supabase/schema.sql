-- Canonical schema for a fresh Picnic Club database.
-- Existing projects should apply supabase/migrations/*.sql instead.

create extension if not exists pgcrypto;

create type public.profile_status as enum ('draft', 'published', 'suspended');

-- ---------------------------------------------------------------------------
-- Admin allowlist
-- ---------------------------------------------------------------------------

create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  note text not null default '',
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
create policy "admins can read the admin list"
  on public.admins for select to authenticated using (user_id = auth.uid());

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admins where user_id = auth.uid()); $$;

grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  username text not null unique
    check (username = lower(username) and username ~ '^[a-z0-9._-]+$'),
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
  published_at timestamptz,
  constraint profiles_username_not_reserved check (
    username !~ '^(admin|superadmin|administrator|userpanel|user|users|members|member|about|support|contact|help|api|auth|login|logout|signin|signup|register|dashboard|settings|account|profile|profiles|brands|brand|faq|privacy|terms|legal|report|reports|static|assets|public|www|mail|blog|news|home|index|null|undefined|next|_next|vercel|supabase|picnic|picnicclub)$'
  )
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

-- profiles: public reads published rows; owner/admin read everything they own
create policy "profiles are readable by owner admin or when published"
  on public.profiles for select
  using (status = 'published' or owner_id = auth.uid() or public.is_admin());
create policy "owner or admin inserts profile"
  on public.profiles for insert to authenticated
  with check (owner_id = auth.uid() or public.is_admin());
create policy "owner or admin updates profile"
  on public.profiles for update to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());
create policy "owner or admin deletes profile"
  on public.profiles for delete to authenticated
  using (owner_id = auth.uid() or public.is_admin());

-- Featuring / level stay admin-only even when a creator edits their own row.
create or replace function public.enforce_admin_only_profile_columns()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if public.is_admin() then return new; end if;
  if new.is_featured is distinct from old.is_featured
     or new.featured_order is distinct from old.featured_order
     or new.level is distinct from old.level then
    raise exception 'is_featured, featured_order and level can only be changed by an admin';
  end if;
  return new;
end;
$$;

create trigger enforce_admin_only_profile_columns
  before update on public.profiles
  for each row execute function public.enforce_admin_only_profile_columns();

-- profile_links: public reads active links of published profiles
create policy "links are readable when public or owned"
  on public.profile_links for select
  using (
    (is_active and exists (
      select 1 from public.profiles p where p.id = profile_id and p.status = 'published'
    ))
    or exists (
      select 1 from public.profiles p
      where p.id = profile_id and (p.owner_id = auth.uid() or public.is_admin())
    )
  );
create policy "owner or admin manages links"
  on public.profile_links for all to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = profile_id and (p.owner_id = auth.uid() or public.is_admin())
  ))
  with check (exists (
    select 1 from public.profiles p
    where p.id = profile_id and (p.owner_id = auth.uid() or public.is_admin())
  ));

create index profiles_published_order on public.profiles(status, is_featured, featured_order);
create index profile_links_profile_order on public.profile_links(profile_id, sort_order);
create index profiles_owner_id on public.profiles(owner_id);

-- ---------------------------------------------------------------------------
-- site_content
-- ---------------------------------------------------------------------------

create table public.site_content (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;
create policy "public can read site content" on public.site_content for select using (true);
create policy "admins manage site content"
  on public.site_content for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

insert into public.site_content (key, value) values
  ('hero_title', 'More than an agency.'),
  ('hero_description', 'Rumah bagi para creator dan affiliator terbaik Indonesia. Grow your influence, income, and network together.'),
  ('marquee_text', 'Indonesia''s largest affiliate community'),
  ('about_title', 'We make creator growth feel less lonely.'),
  ('brands_title', 'Brands we''ve worked with.'),
  ('faq_intro', 'Masih ingin tahu lebih banyak? Tim Picnic Club siap membantu.')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- brands
-- ---------------------------------------------------------------------------

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text not null check (logo_url ~* '^https?://'),
  website_url text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.brands enable row level security;
create policy "brands readable when active or by admin"
  on public.brands for select using (is_active or public.is_admin());
create policy "admins manage brands"
  on public.brands for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- storage: Avatar bucket
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('Avatar', 'Avatar', true)
on conflict (id) do nothing;

create policy "avatars are public"
  on storage.objects for select using (bucket_id = 'Avatar');
create policy "authenticated can upload avatars"
  on storage.objects for insert to authenticated with check (bucket_id = 'Avatar');
create policy "owner or admin updates avatars"
  on storage.objects for update to authenticated
  using (bucket_id = 'Avatar' and (owner = auth.uid() or public.is_admin()))
  with check (bucket_id = 'Avatar' and (owner = auth.uid() or public.is_admin()));
create policy "owner or admin deletes avatars"
  on storage.objects for delete to authenticated
  using (bucket_id = 'Avatar' and (owner = auth.uid() or public.is_admin()));

-- ---------------------------------------------------------------------------
-- First admin: after creating your auth user, run
--   insert into public.admins (user_id, note)
--   select id, 'founder' from auth.users where email = 'you@example.com';
-- ---------------------------------------------------------------------------
