create table if not exists public.brands (
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
drop policy if exists "public can read active brands" on public.brands;
create policy "public can read active brands" on public.brands for select using (is_active = true);
drop policy if exists "admins manage brands" on public.brands;
create policy "admins manage brands" on public.brands for all to authenticated using ((auth.jwt()->>'email') = 'dmortham@gmail.com') with check ((auth.jwt()->>'email') = 'dmortham@gmail.com');

insert into public.brands (name, logo_url, sort_order) values
  ('Pakalolo', 'https://picnicclub.id/wp-content/uploads/2026/06/pakalolo-150x150.jpeg', 1),
  ('Torch', 'https://picnicclub.id/wp-content/uploads/2026/06/logotorch-150x150.jpg', 2),
  ('Antarestar', 'https://picnicclub.id/wp-content/uploads/2026/06/antarestar-150x150.jpeg', 3),
  ('MS Glow', 'https://picnicclub.id/wp-content/uploads/2026/06/msglow-150x150.jpeg', 4),
  ('Kualitas Store', 'https://picnicclub.id/wp-content/uploads/2026/06/kualitasstore-150x150.jpeg', 5),
  ('MS Glow Beauty', 'https://picnicclub.id/wp-content/uploads/2026/06/msglowb-150x150.jpg', 6)
on conflict do nothing;
