-- Discovery features: private per-project bookmarks, and the admin-picked featured slot.
--
-- Both tables follow the security model in the initial migration: the composite primary key
-- enforces the product rule at the database level, and row level security is the only thing that
-- decides who may read or write a row. Nothing here trusts the client.

-- Bookmarks ---------------------------------------------------------------------------------

-- Saving a project is private to the saver and independent of an upvote, which is public ranking.
-- The composite primary key means a project can only be saved once per user.
create table public.bookmarks (
  user_id uuid not null references public.profiles (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, project_id)
);

create index bookmarks_user_idx on public.bookmarks (user_id, created_at desc);

alter table public.bookmarks enable row level security;

-- One policy for both directions: a student may only ever see and touch their own saves.
create policy "a student manages their own bookmarks"
  on public.bookmarks for all
  using ((select auth.uid()) = user_id and public.can_participate())
  with check ((select auth.uid()) = user_id and public.can_participate());

-- Featured project --------------------------------------------------------------------------

-- A reference to the featured project, never a copy of it, plus the window it is live for.
-- One row per project, so re-featuring replaces the previous window instead of stacking them.
create table public.featured_projects (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects (id) on delete cascade,
  starts_at date not null,
  ends_at date not null,
  set_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  check (ends_at >= starts_at)
);

alter table public.featured_projects enable row level security;

-- Anyone may see which project is being featured; only an admin may set or clear it, and the
-- row must name them as the coordinator who made the call.
create policy "the featured project is publicly readable"
  on public.featured_projects for select using (true);

create policy "an admin sets the featured project"
  on public.featured_projects for all
  using (public.is_admin())
  with check (public.is_admin() and set_by = (select auth.uid()));
