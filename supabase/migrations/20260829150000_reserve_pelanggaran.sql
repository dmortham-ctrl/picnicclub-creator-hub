-- Phase 1.5: /pelanggaran is a real page (migrated from WordPress), so no
-- creator may claim it as a username. Keep in sync with lib/validation.ts.
alter table public.profiles drop constraint if exists profiles_username_not_reserved;
alter table public.profiles add constraint profiles_username_not_reserved check (
  username !~ '^(admin|superadmin|administrator|userpanel|user|users|members|member|about|support|contact|help|api|auth|login|logout|signin|signup|register|dashboard|settings|account|profile|profiles|brands|brand|faq|privacy|terms|legal|report|reports|disclosure|pelanggaran|static|assets|public|www|mail|blog|news|home|index|null|undefined|next|_next|vercel|supabase|picnic|picnicclub|l|r|go|track|sitemap|robots)$'
);
