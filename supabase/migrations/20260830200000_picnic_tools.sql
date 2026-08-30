-- Picnic Tools: AI hook / script generator with a per-user daily quota,
-- a 24h shared cache, and creator-saved results.

create table public.tool_generations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  tool text not null check (tool in ('hook', 'script')),
  input jsonb not null default '{}'::jsonb,
  input_hash text not null,
  output jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.tool_generations enable row level security;
create policy "owner reads own tool generations"
  on public.tool_generations for select to authenticated using (owner_id = auth.uid());
create policy "owner inserts own tool generations"
  on public.tool_generations for insert to authenticated with check (owner_id = auth.uid());
create index tool_generations_owner_time on public.tool_generations (owner_id, created_at desc);

-- Shared result cache (not sensitive - AI-generated marketing copy).
create table public.tool_cache (
  input_hash text primary key,
  tool text not null,
  output jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.tool_cache enable row level security;
create policy "authenticated reads cache"
  on public.tool_cache for select to authenticated using (true);
create policy "authenticated writes cache"
  on public.tool_cache for insert to authenticated with check (true);
create policy "authenticated updates cache"
  on public.tool_cache for update to authenticated using (true) with check (true);

create table public.tool_saves (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  tool text not null check (tool in ('hook', 'script')),
  content text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.tool_saves enable row level security;
create policy "owner manages own tool saves"
  on public.tool_saves for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create index tool_saves_owner_time on public.tool_saves (owner_id, tool, created_at desc);
