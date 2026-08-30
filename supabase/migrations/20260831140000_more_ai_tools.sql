-- Picnic AI Tools: add Ide Caption, Skrip Live Selling, Kalender Konten
-- alongside the existing hook / script generators.

alter table public.tool_generations drop constraint if exists tool_generations_tool_check;
alter table public.tool_generations
  add constraint tool_generations_tool_check
  check (tool in ('hook', 'script', 'caption', 'live', 'calendar'));

alter table public.tool_saves drop constraint if exists tool_saves_tool_check;
alter table public.tool_saves
  add constraint tool_saves_tool_check
  check (tool in ('hook', 'script', 'caption', 'live', 'calendar'));
