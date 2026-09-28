-- Initial LaunchPad schema: profiles, sprints, projects, contributors, upvotes, comments.
-- Table and column shapes mirror src/types/index.ts, in snake_case.
--
-- This migration is the security boundary described in docs/auth.md. The client-side domain
-- helper hides UI; the trigger and policies below are what actually enforce the product rules.

-- Enums -----------------------------------------------------------------------------------

-- The 'visitor' role in src/types/index.ts is the absence of a profile row, not a value here.
create type public.user_role as enum ('student', 'admin');

create type public.project_status as enum ('pending', 'approved', 'rejected');

create type public.project_category as enum (
  'Web App', 'Mobile App', 'AI/ML', 'Game Dev', 'Data Science', 'DevOps', 'Other'
);

create type public.sprint_status as enum ('upcoming', 'active', 'completed');

-- Domain rule -----------------------------------------------------------------------------

-- Must stay in sync with ALLOWED_EMAIL_DOMAINS in src/config/site.ts.
create or replace function public.is_allowed_student_email(email text)
returns boolean
language sql
immutable
as $$
  select lower(split_part(coalesce(email, ''), '@', 2))
         in ('ontariotechu.net', 'ontariotechu.ca');
$$;

-- Runs as the auth admin on every new auth.users row. NEW.email comes from a Google ID token
-- whose signature GoTrue has already verified, so it is the one email value safe to trust.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_allowed_student_email(new.email) then
    raise exception 'LaunchPad accounts require an ontariotechu.net or ontariotechu.ca address'
      using errcode = 'check_violation';
  end if;

  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      split_part(new.email, '@', 1)
    ),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  );

  return new;
end;
$$;

-- Profiles --------------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique check (public.is_allowed_student_email(email)),
  name text not null check (char_length(name) between 1 and 80),
  avatar_url text,
  headline text check (char_length(headline) <= 60),
  role public.user_role not null default 'student',
  banned_at timestamptz,
  created_at timestamptz not null default now()
);

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Answers "is the caller allowed to write" without re-entering profiles RLS, which would
-- recurse: every policy below calls these, and they are themselves policy-exempt.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin' and banned_at is null
  );
$$;

create or replace function public.can_participate()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and banned_at is null
  );
$$;

-- A student may edit their display name, not their own role or ban status.
create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.role is distinct from old.role or new.banned_at is distinct from old.banned_at then
    raise exception 'Only an admin may change a role or ban status'
      using errcode = 'insufficient_privilege';
  end if;

  new.email := old.email;
  return new;
end;
$$;

create trigger guard_profile_privileges
before update on public.profiles
for each row execute function public.guard_profile_privileges();

-- Sprints ---------------------------------------------------------------------------------

create table public.sprints (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  theme text not null,
  description text not null default '',
  status public.sprint_status not null default 'upcoming',
  start_date date not null,
  end_date date not null,
  montage_url text,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

-- Projects --------------------------------------------------------------------------------

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null check (char_length(title) between 3 and 80),
  summary text not null check (char_length(summary) between 10 and 160),
  description text not null default '',
  category public.project_category not null,
  tags text[] not null default '{}',
  repo_url text,
  live_url text,
  cover_image_url text,
  screenshot_urls text[] not null default '{}',
  author_id uuid not null references public.profiles (id) on delete cascade,
  sprint_id uuid references public.sprints (id) on delete set null,
  status public.project_status not null default 'pending',
  open_to_contributions boolean not null default false,
  upvote_count integer not null default 0,
  comment_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_feed_idx on public.projects (status, upvote_count desc, created_at desc);
create index projects_author_idx on public.projects (author_id);
create index projects_sprint_idx on public.projects (sprint_id) where sprint_id is not null;

create table public.project_contributors (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null,
  avatar_url text,
  role text
);

create index project_contributors_project_idx on public.project_contributors (project_id);

-- Upvotes ---------------------------------------------------------------------------------

-- The composite primary key is the one-upvote-per-user rule. Do not replace it with a check
-- in application code.
create table public.upvotes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, project_id)
);

create index upvotes_project_idx on public.upvotes (project_id);

-- Comments --------------------------------------------------------------------------------

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index comments_project_idx on public.comments (project_id, created_at desc);

-- Denormalised counts -----------------------------------------------------------------------

create or replace function public.sync_project_counts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid := coalesce(new.project_id, old.project_id);
begin
  update public.projects
  set upvote_count = (select count(*) from public.upvotes where project_id = target),
      comment_count = (select count(*) from public.comments where project_id = target)
  where id = target;

  return null;
end;
$$;

create trigger sync_counts_on_upvote
after insert or delete on public.upvotes
for each row execute function public.sync_project_counts();

create trigger sync_counts_on_comment
after insert or delete on public.comments
for each row execute function public.sync_project_counts();

-- Moderation is the coordinator's call alone, so an author's edit cannot carry a status change.
create or replace function public.guard_project_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    new.status := old.status;
  end if;

  return new;
end;
$$;

create trigger guard_project_status
before update on public.projects
for each row execute function public.guard_project_status();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger touch_projects_updated_at
before update on public.projects
for each row execute function public.touch_updated_at();

-- Row level security ------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.sprints enable row level security;
alter table public.projects enable row level security;
alter table public.project_contributors enable row level security;
alter table public.upvotes enable row level security;
alter table public.comments enable row level security;

create policy "profiles are publicly readable"
  on public.profiles for select using (true);

create policy "a student updates their own profile"
  on public.profiles for update
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "an admin updates any profile"
  on public.profiles for update using (public.is_admin()) with check (public.is_admin());

create policy "sprints are publicly readable"
  on public.sprints for select using (true);

create policy "an admin manages sprints"
  on public.sprints for all using (public.is_admin()) with check (public.is_admin());

-- Rule 1 of the product: anyone can read approved work, with no account.
create policy "approved projects are publicly readable"
  on public.projects for select
  using (status = 'approved' or author_id = (select auth.uid()) or public.is_admin());

-- Submissions always land as pending. A student cannot approve their own project.
create policy "a student submits their own project"
  on public.projects for insert
  with check (
    author_id = (select auth.uid()) and public.can_participate() and status = 'pending'
  );

create policy "a student edits their own project"
  on public.projects for update
  using (author_id = (select auth.uid()) and public.can_participate())
  with check (author_id = (select auth.uid()));

create policy "a student deletes their own project"
  on public.projects for delete
  using (author_id = (select auth.uid()) and public.can_participate());

create policy "an admin moderates projects"
  on public.projects for all using (public.is_admin()) with check (public.is_admin());

create policy "contributors are readable with their project"
  on public.project_contributors for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id
        and (p.status = 'approved' or p.author_id = (select auth.uid()) or public.is_admin())
    )
  );

create policy "an author manages their contributors"
  on public.project_contributors for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.author_id = (select auth.uid())
    )
    and public.can_participate()
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.author_id = (select auth.uid())
    )
    and public.can_participate()
  );

create policy "upvotes are publicly readable"
  on public.upvotes for select using (true);

create policy "a student upvotes an approved project"
  on public.upvotes for insert
  with check (
    user_id = (select auth.uid())
    and public.can_participate()
    and exists (select 1 from public.projects p where p.id = project_id and p.status = 'approved')
  );

-- There is no update policy by design. An upvote is added or removed, never changed, and there
-- is no downvote anywhere in the product.
create policy "a student removes their own upvote"
  on public.upvotes for delete using (user_id = (select auth.uid()));

create policy "comments are readable with their project"
  on public.comments for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id
        and (p.status = 'approved' or p.author_id = (select auth.uid()) or public.is_admin())
    )
  );

create policy "a student comments on an approved project"
  on public.comments for insert
  with check (
    author_id = (select auth.uid())
    and public.can_participate()
    and exists (select 1 from public.projects p where p.id = project_id and p.status = 'approved')
  );

create policy "a student edits their own comment"
  on public.comments for update
  using (author_id = (select auth.uid()) and public.can_participate())
  with check (author_id = (select auth.uid()));

create policy "a student deletes their own comment"
  on public.comments for delete using (author_id = (select auth.uid()));

create policy "an admin moderates comments"
  on public.comments for all using (public.is_admin()) with check (public.is_admin());
