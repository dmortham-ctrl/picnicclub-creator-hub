-- Default owner_id to the caller so client-side inserts (tool_saves) satisfy
-- both the NOT NULL constraint and the owner_id = auth.uid() RLS check.
alter table public.tool_saves alter column owner_id set default auth.uid();
alter table public.tool_generations alter column owner_id set default auth.uid();
