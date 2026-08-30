-- Phase 2: "Katalog Produk" block. A product block is one profile_links row
-- (block_type = 'product') carrying: label = product name, url = affiliate
-- link, image_url = product photo, content.price / content.price_original =
-- display prices. Consecutive product blocks render as a grid on the minisite.

alter table public.profile_links drop constraint if exists profile_links_block_type_check;

alter table public.profile_links
  add constraint profile_links_block_type_check
  check (block_type in ('link', 'text', 'social', 'photo', 'product'));
