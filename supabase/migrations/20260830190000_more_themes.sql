-- Four more minisite templates (10 total).
alter table public.profiles drop constraint if exists profiles_theme_check;
alter table public.profiles
  add constraint profiles_theme_check
  check (theme in ('default', 'midnight', 'lime', 'coral', 'blossom', 'ocean', 'sunset', 'grape', 'mint', 'mono'));
