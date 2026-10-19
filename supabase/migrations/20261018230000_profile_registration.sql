-- Registration details collected when a student creates their account, and the marker that says
-- registration is finished. Verifying an email only creates a bare profile row, so registered_at
-- is what separates "has an account" from "proved they own an address and stopped".

alter table public.profiles
  add column program text check (char_length(program) <= 80),
  add column study_year text check (study_year in ('Year 1', 'Year 2', 'Year 3', 'Year 4')),
  add column skills text[] not null default '{}' check (cardinality(skills) <= 20),
  add column bio text check (char_length(bio) <= 500),
  add column registered_at timestamptz;

-- Every profile that exists today predates this step, so it counts as registered.
update public.profiles set registered_at = created_at;

-- A student who has not finished registering cannot post, upvote, or comment.
create or replace function public.can_participate()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and banned_at is null and registered_at is not null
  );
$$;
