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
  theme text not null default 'default' check (theme in ('default', 'midnight', 'lime', 'coral', 'blossom', 'ocean')),
  accent_color text not null default '' check (accent_color = '' or accent_color ~* '^#[0-9a-f]{6}$'),
  button_style text not null default 'fill' check (button_style in ('fill', 'outline', 'shadow')),
  button_shape text not null default 'rounded' check (button_shape in ('sharp', 'rounded', 'pill')),
  banner_url text not null default '' check (banner_url = '' or banner_url ~* '^https?://'),
  layout text not null default 'classic' check (layout in ('classic', 'full')),
  claim_email text not null default '',
  status public.profile_status not null default 'draft',
  is_featured boolean not null default false,
  featured_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint profiles_username_not_reserved check (
    username !~ '^(admin|superadmin|administrator|userpanel|user|users|members|member|about|support|contact|help|api|auth|login|logout|signin|signup|register|dashboard|settings|account|profile|profiles|brands|brand|faq|privacy|terms|legal|report|reports|disclosure|pelanggaran|static|assets|public|www|mail|blog|news|home|index|null|undefined|next|_next|vercel|supabase|picnic|picnicclub|l|r|go|track|sitemap|robots)$'
  )
);

create table public.profile_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default '',
  url text not null default '' check (url = '' or url ~* '^https?://'),
  link_type text not null default 'link',
  block_type text not null default 'link' check (block_type in ('link', 'text', 'social', 'photo')),
  content jsonb not null default '{}'::jsonb,
  icon_key text not null default 'link',
  image_url text not null default '' check (image_url = '' or image_url ~* '^https?://'),
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
  ('faq_intro', 'Masih ingin tahu lebih banyak? Tim Picnic Club siap membantu.'),
  ('founder_usernames', 'inproduk,bertosb1m,adli.hibatul,aditsur88,sobatkaryawan')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- faqs (drives the homepage FAQ section)
-- ---------------------------------------------------------------------------

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.faqs enable row level security;
create policy "faqs readable when active or by admin"
  on public.faqs for select using (is_active or public.is_admin());
create policy "admins manage faqs"
  on public.faqs for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- analytics_events (no PII, no raw affiliate query strings)
-- ---------------------------------------------------------------------------

create table public.analytics_events (
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
create policy "anyone can record an event"
  on public.analytics_events for insert to anon, authenticated with check (true);
create policy "admins read events"
  on public.analytics_events for select to authenticated using (public.is_admin());

create index analytics_events_name_time on public.analytics_events (event_name, occurred_at desc);
create index analytics_events_profile_time on public.analytics_events (profile_id, occurred_at desc);
create index analytics_events_link_time on public.analytics_events (link_id, occurred_at desc);

create or replace function public.analytics_summary(days integer default 30)
returns json language sql stable security invoker set search_path = public
as $$
  with window_events as (
    select * from public.analytics_events where occurred_at > now() - make_interval(days => days)
  )
  select json_build_object(
    'window_days', days,
    'totals', (select coalesce(json_object_agg(event_name, c), '{}'::json)
      from (select event_name, count(*) c from window_events group by event_name) t),
    'daily', (select coalesce(json_agg(row_to_json(d) order by d.day), '[]'::json) from (
      select date_trunc('day', occurred_at)::date as day,
             count(*) filter (where event_name = 'page_view') as page_views,
             count(*) filter (where event_name = 'profile_view') as profile_views,
             count(*) filter (where event_name = 'link_click') as link_clicks,
             count(*) filter (where event_name = 'cta_click') as cta_clicks
      from window_events group by 1) d),
    'top_links', (select coalesce(json_agg(row_to_json(l)), '[]'::json) from (
      select pl.label, pl.url, p.username, count(*) as clicks
      from window_events e join public.profile_links pl on pl.id = e.link_id
      join public.profiles p on p.id = pl.profile_id
      where e.event_name = 'link_click' group by pl.label, pl.url, p.username
      order by clicks desc limit 10) l),
    'top_profiles', (select coalesce(json_agg(row_to_json(pr)), '[]'::json) from (
      select p.username, p.display_name, count(*) as views
      from window_events e join public.profiles p on p.id = e.profile_id
      where e.event_name = 'profile_view' group by p.username, p.display_name
      order by views desc limit 10) pr),
    'top_ctas', (select coalesce(json_object_agg(cta_key, c), '{}'::json) from (
      select cta_key, count(*) c from window_events
      where event_name = 'cta_click' and cta_key is not null group by cta_key) t)
  );
$$;

grant execute on function public.analytics_summary(integer) to authenticated;

-- Per-profile analytics a creator can read for a profile they own.
create or replace function public.creator_analytics(target uuid, days integer default 30)
returns json language plpgsql stable security definer set search_path = public
as $$
declare
  allowed boolean;
begin
  select (owner_id = auth.uid()) or public.is_admin() into allowed
  from public.profiles where id = target;
  if not coalesce(allowed, false) then
    raise exception 'not allowed to read analytics for this profile';
  end if;
  return (
    with ev as (
      select * from public.analytics_events
      where profile_id = target and occurred_at > now() - make_interval(days => days)
    )
    select json_build_object(
      'window_days', days,
      'profile_views', (select count(*) from ev where event_name = 'profile_view'),
      'link_clicks', (select count(*) from ev where event_name = 'link_click'),
      'daily', (select coalesce(json_agg(row_to_json(d) order by d.day), '[]'::json) from (
        select date_trunc('day', occurred_at)::date as day,
               count(*) filter (where event_name = 'profile_view') as profile_views,
               count(*) filter (where event_name = 'link_click') as link_clicks
        from ev group by 1) d),
      'top_links', (select coalesce(json_agg(row_to_json(l) order by l.clicks desc, l.label), '[]'::json) from (
        select pl.id, pl.label, count(e.*) as clicks
        from public.profile_links pl
        left join ev e on e.link_id = pl.id and e.event_name = 'link_click'
        where pl.profile_id = target
        group by pl.id, pl.label) l)
    )
  );
end;
$$;
grant execute on function public.creator_analytics(uuid, integer) to authenticated;

-- Creators claim a placeholder profile an admin reserved for them.
create index if not exists profiles_claim_email_idx on public.profiles (lower(claim_email)) where claim_email <> '';
create or replace function public.claim_profile(target_username text default null)
returns public.profiles language plpgsql security definer set search_path = public
as $$
declare my_email text; claimed public.profiles;
begin
  select email into my_email from auth.users where id = auth.uid();
  if my_email is null or my_email = '' then raise exception 'not authenticated'; end if;
  if target_username is not null then
    update public.profiles set owner_id = auth.uid(), claim_email = ''
     where lower(username) = lower(trim(target_username)) and owner_id is null
       and (claim_email = '' or lower(claim_email) = lower(my_email))
     returning * into claimed;
  else
    update public.profiles set owner_id = auth.uid(), claim_email = ''
     where id = (select id from public.profiles where lower(claim_email) = lower(my_email) and owner_id is null order by created_at limit 1)
     returning * into claimed;
  end if;
  return claimed;
end;
$$;
grant execute on function public.claim_profile(text) to authenticated;

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
