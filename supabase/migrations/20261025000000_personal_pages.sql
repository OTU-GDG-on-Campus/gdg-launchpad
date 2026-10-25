-- Public profile projection omits private account fields. Full rows are owner/admin only.

alter table public.profiles add column github_url text
  check (github_url is null or github_url ~ '^https://github[.]com/[A-Za-z0-9-]+/?$');

drop policy "profiles are publicly readable" on public.profiles;
create policy "owners and admins read account profiles"
  on public.profiles for select
  using (id = (select auth.uid()) or public.is_admin());

-- The view owner reads through RLS, but the fixed projection never exposes email or privileges.
create view public.public_profiles with (security_barrier = true) as
  select id, name, avatar_url, headline, program, study_year, skills, bio, github_url
  from public.profiles
  where registered_at is not null and banned_at is null;
revoke all on public.public_profiles from public, anon, authenticated;
grant select on public.public_profiles to anon, authenticated;

-- Incomplete students must still be able to finish registration; banned accounts cannot edit.
create or replace function public.guard_profile_privileges()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if public.is_admin() then return new; end if;
  if old.banned_at is not null then
    raise exception 'This account cannot update its profile' using errcode = 'insufficient_privilege';
  end if;
  if new.role is distinct from old.role or new.banned_at is distinct from old.banned_at then
    raise exception 'Only an admin may change a role or ban status' using errcode = 'insufficient_privilege';
  end if;
  if new.name is null or char_length(trim(new.name)) not between 1 and 80 then
    raise exception 'A name between 1 and 80 characters is required';
  end if;
  if new.registered_at is not null and (
    coalesce(trim(new.program), '') = '' or new.study_year is null
  ) then raise exception 'Program and study year are required'; end if;
  if exists (select 1 from unnest(new.skills) skill where char_length(trim(skill)) not between 1 and 40) then
    raise exception 'Skills must be between 1 and 40 characters';
  end if;
  new.email := old.email;
  if old.registered_at is not null then new.registered_at := old.registered_at; end if;
  return new;
end;
$$;
