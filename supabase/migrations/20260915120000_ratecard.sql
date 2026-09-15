-- Rate Card: a new profile block type + AI tool.
-- Block: a card on the minisite listing paid collab services (video, live,
-- bundle, etc.) with prices, generated (and re-editable) from the AI tool.

alter table public.profile_links drop constraint profile_links_block_type_check;
alter table public.profile_links add constraint profile_links_block_type_check
  check (block_type in ('link', 'text', 'social', 'photo', 'product', 'ratecard'));

alter table public.tool_generations drop constraint tool_generations_tool_check;
alter table public.tool_generations add constraint tool_generations_tool_check
  check (tool in ('hook', 'script', 'caption', 'live', 'calendar', 'analysis', 'ratecard'));

alter table public.tool_saves drop constraint tool_saves_tool_check;
alter table public.tool_saves add constraint tool_saves_tool_check
  check (tool in ('hook', 'script', 'caption', 'live', 'calendar', 'analysis', 'ratecard'));
