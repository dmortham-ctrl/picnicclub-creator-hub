-- Creator dashboard: per-link thumbnails + self-serve analytics.

-- ---------------------------------------------------------------------------
-- profile_links.image_url  (optional product / link thumbnail)
-- ---------------------------------------------------------------------------

alter table public.profile_links
  add column if not exists image_url text not null default '';

alter table public.profile_links
  drop constraint if exists profile_links_image_url_check;
alter table public.profile_links
  add constraint profile_links_image_url_check
  check (image_url = '' or image_url ~* '^https?://');

-- ---------------------------------------------------------------------------
-- creator_analytics(target, days)
-- A creator (or an admin) can read the aggregate traffic for a profile they
-- own. SECURITY DEFINER so it can read analytics_events, gated by an explicit
-- ownership check. No visitor PII is returned.
-- ---------------------------------------------------------------------------

create or replace function public.creator_analytics(target uuid, days integer default 30)
returns json
language plpgsql stable security definer set search_path = public
as $$
declare
  allowed boolean;
begin
  select (owner_id = auth.uid()) or public.is_admin()
    into allowed
  from public.profiles
  where id = target;

  if not coalesce(allowed, false) then
    raise exception 'not allowed to read analytics for this profile';
  end if;

  return (
    with ev as (
      select *
      from public.analytics_events
      where profile_id = target
        and occurred_at > now() - make_interval(days => days)
    )
    select json_build_object(
      'window_days', days,
      'profile_views', (select count(*) from ev where event_name = 'profile_view'),
      'link_clicks', (select count(*) from ev where event_name = 'link_click'),
      'daily', (select coalesce(json_agg(row_to_json(d) order by d.day), '[]'::json) from (
        select date_trunc('day', occurred_at)::date as day,
               count(*) filter (where event_name = 'profile_view') as profile_views,
               count(*) filter (where event_name = 'link_click') as link_clicks
        from ev
        group by 1
      ) d),
      'top_links', (select coalesce(json_agg(row_to_json(l) order by l.clicks desc, l.label), '[]'::json) from (
        select pl.id, pl.label, count(e.*) as clicks
        from public.profile_links pl
        left join ev e on e.link_id = pl.id and e.event_name = 'link_click'
        where pl.profile_id = target
        group by pl.id, pl.label
      ) l)
    )
  );
end;
$$;

grant execute on function public.creator_analytics(uuid, integer) to authenticated;
