-- Aggregated analytics for the admin dashboard. SECURITY INVOKER so the
-- "admins read events" RLS policy still applies - non-admins get empty results.

create or replace function public.analytics_summary(days integer default 30)
returns json
language sql
stable
security invoker
set search_path = public
as $$
  with window_events as (
    select * from public.analytics_events
    where occurred_at > now() - make_interval(days => days)
  )
  select json_build_object(
    'window_days', days,
    'totals', (
      select coalesce(json_object_agg(event_name, c), '{}'::json)
      from (select event_name, count(*) c from window_events group by event_name) t
    ),
    'daily', (
      select coalesce(json_agg(row_to_json(d) order by d.day), '[]'::json)
      from (
        select date_trunc('day', occurred_at)::date as day,
               count(*) filter (where event_name = 'page_view') as page_views,
               count(*) filter (where event_name = 'profile_view') as profile_views,
               count(*) filter (where event_name = 'link_click') as link_clicks,
               count(*) filter (where event_name = 'cta_click') as cta_clicks
        from window_events group by 1
      ) d
    ),
    'top_links', (
      select coalesce(json_agg(row_to_json(l)), '[]'::json)
      from (
        select pl.label, pl.url, p.username, count(*) as clicks
        from window_events e
        join public.profile_links pl on pl.id = e.link_id
        join public.profiles p on p.id = pl.profile_id
        where e.event_name = 'link_click'
        group by pl.label, pl.url, p.username
        order by clicks desc limit 10
      ) l
    ),
    'top_profiles', (
      select coalesce(json_agg(row_to_json(pr)), '[]'::json)
      from (
        select p.username, p.display_name, count(*) as views
        from window_events e
        join public.profiles p on p.id = e.profile_id
        where e.event_name = 'profile_view'
        group by p.username, p.display_name
        order by views desc limit 10
      ) pr
    ),
    'top_ctas', (
      select coalesce(json_object_agg(cta_key, c), '{}'::json)
      from (
        select cta_key, count(*) c from window_events
        where event_name = 'cta_click' and cta_key is not null
        group by cta_key
      ) t
    )
  );
$$;

grant execute on function public.analytics_summary(integer) to authenticated;
