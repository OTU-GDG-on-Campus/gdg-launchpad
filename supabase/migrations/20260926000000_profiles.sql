-- Profiles for verified Ontario Tech students, plus the sign-up trigger that enforces the email
-- domain rule. This trigger is the security boundary described in docs/auth.md.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  name text not null,
  avatar_url text,
  role text not null default 'student' check (role in ('student', 'admin')),
  banned_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Security definer so policies can read profiles without recursing through RLS on this table.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and banned_at is null
  );
$$;

-- The check every write policy on projects, upvotes, and comments should use.
create function public.can_participate()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and banned_at is null
  );
$$;

create policy "Students read their own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "Admins read every profile"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

create policy "Admins update profiles"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Rows are only ever created by the trigger below, so no insert policy exists. Students cannot
-- edit their own row yet, since profile edits must go through admin review first.

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowed_domains constant text[] := array['ontariotechu.net', 'ontariotechu.ca'];
  -- Google puts the Workspace domain in the signed "hd" claim. Consumer accounts have none.
  hosted_domain text := lower(new.raw_user_meta_data -> 'custom_claims' ->> 'hd');
  email_domain text := lower(split_part(new.email, '@', 2));
begin
  if coalesce(new.raw_app_meta_data ->> 'provider', '') <> 'google' then
    raise exception 'LaunchPad only accepts Google sign-in with an Ontario Tech account';
  end if;

  if hosted_domain is null
     or not (hosted_domain = any (allowed_domains))
     or email_domain <> hosted_domain then
    raise exception 'LaunchPad only accepts Ontario Tech Google accounts';
  end if;

  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    lower(new.email),
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  );

  return new;
end;
$$;

-- Raising inside this trigger rolls back the auth.users insert, so a rejected account never exists.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
