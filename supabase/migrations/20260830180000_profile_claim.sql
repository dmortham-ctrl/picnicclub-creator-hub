-- Let real creators take over a placeholder profile that an admin pre-created
-- for them, keeping the reserved username.

alter table public.profiles add column if not exists claim_email text not null default '';
create index if not exists profiles_claim_email_idx on public.profiles (lower(claim_email)) where claim_email <> '';

-- The signed-in user claims ownership of an unowned profile.
--   * with target_username: that profile, if it is unowned and either open
--     (claim_email = '') or reserved for the caller's email.
--   * without: the first unowned profile reserved for the caller's email.
-- Returns the claimed row, or null when there is nothing to claim.
create or replace function public.claim_profile(target_username text default null)
returns public.profiles
language plpgsql security definer set search_path = public
as $$
declare
  my_email text;
  claimed public.profiles;
begin
  select email into my_email from auth.users where id = auth.uid();
  if my_email is null or my_email = '' then
    raise exception 'not authenticated';
  end if;

  if target_username is not null then
    update public.profiles
       set owner_id = auth.uid(), claim_email = ''
     where lower(username) = lower(trim(target_username))
       and owner_id is null
       and (claim_email = '' or lower(claim_email) = lower(my_email))
     returning * into claimed;
  else
    update public.profiles
       set owner_id = auth.uid(), claim_email = ''
     where id = (
       select id from public.profiles
       where lower(claim_email) = lower(my_email) and owner_id is null
       order by created_at
       limit 1
     )
     returning * into claimed;
  end if;

  return claimed;
end;
$$;

grant execute on function public.claim_profile(text) to authenticated;
