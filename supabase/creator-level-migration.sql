alter table public.profiles
add column if not exists level text not null default 'Rising';

update public.profiles
set level = case when is_featured then 'All Star' else 'Rising' end
where level = 'Rising';

alter table public.profiles
drop constraint if exists profiles_level_check;

alter table public.profiles
add constraint profiles_level_check check (level in ('All Star', 'Featured', 'Rising'));
