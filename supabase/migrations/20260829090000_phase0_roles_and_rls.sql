-- Phase 0: role model + owner-based RLS
--
-- Replaces the single hardcoded-email policies with:
--   * public.admins  - allowlist of admin user ids
--   * public.is_admin() - SECURITY DEFINER helper (no recursion into profiles)
--   * owner-based policies so a creator manages only their own profile/links
--   * admins manage everything
--
-- Safe to run against the existing database: every policy is dropped before
-- being recreated, and additive objects use "if not exists".

-- ---------------------------------------------------------------------------
-- 1. Admin allowlist + helper
-- ---------------------------------------------------------------------------

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  note text not null default '',
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

drop policy if exists "admins can read the admin list" on public.admins;
create policy "admins can read the admin list"
  on public.admins for select
  to authenticated
  using (user_id = auth.uid());

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- Seed the current admin. Add more with:
--   insert into public.admins (user_id, note)
--   select id, 'name' from auth.users where email = 'someone@example.com'
--   on conflict do nothing;
insert into public.admins (user_id, note)
select id, 'migrated from hardcoded email'
from auth.users
where email = 'dmortham@gmail.com'
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- 2. profiles
-- ---------------------------------------------------------------------------

drop policy if exists "published profiles are public" on public.profiles;
drop policy if exists "authenticated admins manage profiles" on public.profiles;
drop policy if exists "profiles are readable by owner admin or when published" on public.profiles;
drop policy if exists "owner or admin inserts profile" on public.profiles;
drop policy if exists "owner or admin updates profile" on public.profiles;
drop policy if exists "owner or admin deletes profile" on public.profiles;

create policy "profiles are readable by owner admin or when published"
  on public.profiles for select
  using (status = 'published' or owner_id = auth.uid() or public.is_admin());

create policy "owner or admin inserts profile"
  on public.profiles for insert
  to authenticated
  with check (owner_id = auth.uid() or public.is_admin());

create policy "owner or admin updates profile"
  on public.profiles for update
  to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

create policy "owner or admin deletes profile"
  on public.profiles for delete
  to authenticated
  using (owner_id = auth.uid() or public.is_admin());

-- Featuring and creator level stay admin-controlled even though creators can
-- edit the rest of their own row (PRD: admin decides featured / top affiliate).
create or replace function public.enforce_admin_only_profile_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;
  if new.is_featured is distinct from old.is_featured
     or new.featured_order is distinct from old.featured_order
     or new.level is distinct from old.level then
    raise exception 'is_featured, featured_order and level can only be changed by an admin';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_admin_only_profile_columns on public.profiles;
create trigger enforce_admin_only_profile_columns
  before update on public.profiles
  for each row execute function public.enforce_admin_only_profile_columns();

-- ---------------------------------------------------------------------------
-- 3. Reserved usernames (server-enforced)
-- ---------------------------------------------------------------------------

alter table public.profiles drop constraint if exists profiles_username_not_reserved;
alter table public.profiles add constraint profiles_username_not_reserved check (
  username !~ '^(admin|superadmin|administrator|userpanel|user|users|members|member|about|support|contact|help|api|auth|login|logout|signin|signup|register|dashboard|settings|account|profile|profiles|brands|brand|faq|privacy|terms|legal|report|reports|static|assets|public|www|mail|blog|news|home|index|null|undefined|next|_next|vercel|supabase|picnic|picnicclub)$'
);

-- ---------------------------------------------------------------------------
-- 4. profile_links
-- ---------------------------------------------------------------------------

drop policy if exists "active links of published profiles are public" on public.profile_links;
drop policy if exists "authenticated admins manage links" on public.profile_links;
drop policy if exists "links are readable when public or owned" on public.profile_links;
drop policy if exists "owner or admin manages links" on public.profile_links;

create policy "links are readable when public or owned"
  on public.profile_links for select
  using (
    (is_active and exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.status = 'published'
    ))
    or exists (
      select 1 from public.profiles p
      where p.id = profile_id and (p.owner_id = auth.uid() or public.is_admin())
    )
  );

create policy "owner or admin manages links"
  on public.profile_links for all
  to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = profile_id and (p.owner_id = auth.uid() or public.is_admin())
  ))
  with check (exists (
    select 1 from public.profiles p
    where p.id = profile_id and (p.owner_id = auth.uid() or public.is_admin())
  ));

-- ---------------------------------------------------------------------------
-- 5. site_content
-- ---------------------------------------------------------------------------

drop policy if exists "public can read site content" on public.site_content;
drop policy if exists "admins manage site content" on public.site_content;

create policy "public can read site content"
  on public.site_content for select using (true);

create policy "admins manage site content"
  on public.site_content for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 6. brands  (admins also need to see inactive rows in the CMS)
-- ---------------------------------------------------------------------------

drop policy if exists "public can read active brands" on public.brands;
drop policy if exists "admins manage brands" on public.brands;
drop policy if exists "brands readable when active or by admin" on public.brands;

create policy "brands readable when active or by admin"
  on public.brands for select
  using (is_active or public.is_admin());

create policy "admins manage brands"
  on public.brands for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 7. storage: Avatar bucket
-- ---------------------------------------------------------------------------

drop policy if exists "public can view avatars" on storage.objects;
drop policy if exists "admins can upload avatars" on storage.objects;
drop policy if exists "admins can update avatars" on storage.objects;
drop policy if exists "admins can delete avatars" on storage.objects;
drop policy if exists "avatars are public" on storage.objects;
drop policy if exists "authenticated can upload avatars" on storage.objects;
drop policy if exists "owner or admin updates avatars" on storage.objects;
drop policy if exists "owner or admin deletes avatars" on storage.objects;

create policy "avatars are public"
  on storage.objects for select
  using (bucket_id = 'Avatar');

create policy "authenticated can upload avatars"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'Avatar');

create policy "owner or admin updates avatars"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'Avatar' and (owner = auth.uid() or public.is_admin()))
  with check (bucket_id = 'Avatar' and (owner = auth.uid() or public.is_admin()));

create policy "owner or admin deletes avatars"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'Avatar' and (owner = auth.uid() or public.is_admin()));
