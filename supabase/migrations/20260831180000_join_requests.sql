-- Native "Join Agency" signup form (replaces the Google Form embed on
-- /join and /join-shopee, which forced visitors to sign in to Google).

create table public.join_requests (
  id uuid primary key default gen_random_uuid(),
  program text not null check (program in ('tiktok', 'shopee')),
  name text not null,
  whatsapp text not null,
  email text not null default '',
  social_username text not null default '',
  experience text not null default '',
  note text not null default '',
  status text not null default 'new' check (status in ('new', 'contacted', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.join_requests enable row level security;

-- Anyone can submit a request (the form is public); the API route rate-limits.
create policy "anyone submits a join request"
  on public.join_requests for insert to anon, authenticated
  with check (true);

-- Only admins can read / triage them.
create policy "admins read join requests"
  on public.join_requests for select to authenticated
  using (public.is_admin());
create policy "admins update join requests"
  on public.join_requests for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create index join_requests_program_time on public.join_requests (program, created_at desc);
