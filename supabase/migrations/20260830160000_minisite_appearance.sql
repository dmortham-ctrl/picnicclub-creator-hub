-- Minisite appearance controls (dibio-style): more themes, custom accent
-- colour, button style + shape, banner image, and a full-bleed header layout.

alter table public.profiles drop constraint if exists profiles_theme_check;
alter table public.profiles
  add constraint profiles_theme_check
  check (theme in ('default', 'midnight', 'lime', 'coral', 'blossom', 'ocean'));

alter table public.profiles add column if not exists accent_color text not null default '';
alter table public.profiles drop constraint if exists profiles_accent_color_check;
alter table public.profiles
  add constraint profiles_accent_color_check
  check (accent_color = '' or accent_color ~* '^#[0-9a-f]{6}$');

alter table public.profiles add column if not exists button_style text not null default 'fill';
alter table public.profiles drop constraint if exists profiles_button_style_check;
alter table public.profiles
  add constraint profiles_button_style_check
  check (button_style in ('fill', 'outline', 'shadow'));

alter table public.profiles add column if not exists button_shape text not null default 'rounded';
alter table public.profiles drop constraint if exists profiles_button_shape_check;
alter table public.profiles
  add constraint profiles_button_shape_check
  check (button_shape in ('sharp', 'rounded', 'pill'));

alter table public.profiles add column if not exists banner_url text not null default '';
alter table public.profiles drop constraint if exists profiles_banner_url_check;
alter table public.profiles
  add constraint profiles_banner_url_check
  check (banner_url = '' or banner_url ~* '^https?://');

alter table public.profiles add column if not exists layout text not null default 'classic';
alter table public.profiles drop constraint if exists profiles_layout_check;
alter table public.profiles
  add constraint profiles_layout_check
  check (layout in ('classic', 'full'));
