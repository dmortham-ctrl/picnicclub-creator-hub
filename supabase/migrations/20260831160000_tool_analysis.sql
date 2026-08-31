-- Picnic AI Tools: add "Analisa Produk" (product research brief).

alter table public.tool_generations drop constraint if exists tool_generations_tool_check;
alter table public.tool_generations
  add constraint tool_generations_tool_check
  check (tool in ('hook', 'script', 'caption', 'live', 'calendar', 'analysis'));

alter table public.tool_saves drop constraint if exists tool_saves_tool_check;
alter table public.tool_saves
  add constraint tool_saves_tool_check
  check (tool in ('hook', 'script', 'caption', 'live', 'calendar', 'analysis'));
