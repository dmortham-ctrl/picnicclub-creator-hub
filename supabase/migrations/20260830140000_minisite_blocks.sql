-- Minisite blocks: profile_links rows can now be a link, a text block, a
-- social-icon row, or a photo. Existing rows stay 'link'.

alter table public.profile_links
  add column if not exists block_type text not null default 'link';
alter table public.profile_links
  drop constraint if exists profile_links_block_type_check;
alter table public.profile_links
  add constraint profile_links_block_type_check
  check (block_type in ('link', 'text', 'social', 'photo'));

alter table public.profile_links
  add column if not exists content jsonb not null default '{}'::jsonb;

-- Non-link blocks may have no URL.
alter table public.profile_links alter column url set default '';
alter table public.profile_links alter column label set default '';
alter table public.profile_links drop constraint if exists profile_links_url_check;
alter table public.profile_links
  add constraint profile_links_url_check
  check (url = '' or url ~* '^https?://');
