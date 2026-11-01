-- Private resumable onboarding, atomic profile publication, optional links, and owned profile media.

alter table public.profiles
  drop constraint profiles_study_year_check,
  add constraint profiles_study_year_check check (study_year in ('Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5+', 'Graduate')),
  add column first_name text not null default '' check (char_length(first_name) <= 40),
  add column last_name text not null default '' check (char_length(last_name) <= 40),
  add column introduction text not null default '' check (char_length(introduction) <= 280),
  add column graduation_year integer check (graduation_year between 2000 and 2100),
  add column languages text[] not null default '{}',
  add column frameworks text[] not null default '{}',
  add column tools text[] not null default '{}',
  add column interests text[] not null default '{}',
  add column preferred_roles text[] not null default '{}',
  add column collaboration text[] not null default '{}',
  add column avatar_path text,
  add column banner_path text;

-- Existing registrations remain complete. First and last names stay out of the public projection.
update public.profiles set first_name = left(split_part(name, ' ', 1), 40),
  last_name = left(trim(substring(name from position(' ' in name) + 1)), 40)
  where registered_at is not null;

create or replace function public.is_allowed_student_email(email text)
returns boolean language sql immutable set search_path = '' as $$
  select coalesce(email, '') ~* '^[^[:space:]@]+@ontariotechu[.](net|ca)$';
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_allowed_student_email(new.email) then
    raise exception 'LaunchPad accounts require an ontariotechu.net or ontariotechu.ca address'
      using errcode = 'check_violation';
  end if;
  insert into public.profiles (id, email, name)
    values (new.id, lower(new.email), left(split_part(new.email, '@', 1), 80));
  return new;
end;
$$;

-- Ownership comes from Auth's confirmed email, never raw user metadata or a client claim.
create function public.can_edit_profile()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p join auth.users u on u.id = p.id
    where p.id = (select auth.uid()) and p.banned_at is null
    and u.email_confirmed_at is not null and public.is_allowed_student_email(u.email));
$$;
revoke all on function public.can_edit_profile() from public;
grant execute on function public.can_edit_profile() to authenticated;

create or replace function public.can_participate()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.can_edit_profile() and exists (select 1 from public.profiles
    where id = (select auth.uid()) and registered_at is not null);
$$;

create table public.onboarding_drafts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  details jsonb not null default '{}' check (jsonb_typeof(details) = 'object' and octet_length(details::text) <= 65536),
  step integer not null default 3 check (step between 3 and 7),
  revision integer not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.onboarding_drafts enable row level security;
revoke all on public.onboarding_drafts from public, anon, authenticated;
grant select on public.onboarding_drafts to authenticated;
create policy "owners read private onboarding drafts" on public.onboarding_drafts
  for select to authenticated using (user_id = (select auth.uid()) and public.can_edit_profile());

create function public.save_onboarding_draft(p_details jsonb, p_step integer, p_revision integer)
returns integer language plpgsql security definer set search_path = '' as $$
declare current_revision integer;
begin
  if not public.can_edit_profile() then raise exception 'Sign in again to save your progress'; end if;
  insert into public.onboarding_drafts(user_id) values (auth.uid()) on conflict do nothing;
  select revision into current_revision from public.onboarding_drafts where user_id = auth.uid() for update;
  if current_revision <> p_revision then raise exception 'Your draft changed in another tab. Reload before editing.'; end if;
  update public.onboarding_drafts set details = p_details, step = p_step,
    revision = revision + 1, updated_at = now() where user_id = auth.uid();
  return current_revision + 1;
end;
$$;
revoke all on function public.save_onboarding_draft(jsonb, integer, integer) from public, anon;
grant execute on function public.save_onboarding_draft(jsonb, integer, integer) to authenticated;

create table public.profile_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null check (platform in ('github', 'linkedin', 'portfolio', 'discord', 'instagram', 'x', 'gitlab', 'leetcode', 'stackoverflow', 'devto', 'youtube', 'behance', 'dribbble', 'custom')),
  label text not null check (char_length(trim(label)) between 1 and 60),
  value text not null check (char_length(value) between 1 and 2048),
  is_public boolean not null default true,
  position integer not null check (position between 0 and 19),
  unique (user_id, position),
  check ((platform = 'discord' and value ~ '^[a-z0-9_.]{2,32}$' and value not like '%..%') or
    (platform <> 'discord' and value ~ '^https?://[A-Za-z0-9.-]+[.][A-Za-z0-9-]+([/?#][^[:space:]\\]*)?$'))
);
create index profile_links_user_idx on public.profile_links(user_id);
alter table public.profile_links enable row level security;
revoke all on public.profile_links from public, anon, authenticated;
grant select on public.profile_links to anon, authenticated;
grant insert, update, delete on public.profile_links to authenticated;
create policy "owners read their links" on public.profile_links for select to authenticated
  using (user_id = (select auth.uid()) and public.can_edit_profile());
create policy "visitors read explicitly public links" on public.profile_links for select
  using (is_public and exists (select 1 from public.public_profiles p where p.id = user_id));
create policy "owners insert their links" on public.profile_links for insert to authenticated
  with check (user_id = (select auth.uid()) and public.can_edit_profile());
create policy "owners update their links" on public.profile_links for update to authenticated
  using (user_id = (select auth.uid()) and public.can_edit_profile())
  with check (user_id = (select auth.uid()) and public.can_edit_profile());
create policy "owners delete their links" on public.profile_links for delete to authenticated
  using (user_id = (select auth.uid()) and public.can_edit_profile());

insert into public.profile_links(user_id, platform, label, value, position)
  select id, 'github', 'GitHub', github_url, 0 from public.profiles where github_url is not null;
update public.profiles set github_url = null;

create or replace view public.public_profiles with (security_barrier = true) as
  select id, name, avatar_url, headline, program, study_year, skills, bio, github_url,
    introduction, graduation_year, languages, frameworks, tools, interests, preferred_roles,
    collaboration, avatar_path, banner_path
  from public.profiles where registered_at is not null and banned_at is null;

-- Completion is writable only through the transactional RPC. Legacy profile edits remain supported.
revoke update on public.profiles from public, anon, authenticated;
grant update (name, program, study_year, skills, bio, github_url, role, banned_at) on public.profiles to authenticated;

create function public.profile_text_array(payload jsonb, field text)
returns text[] language plpgsql immutable set search_path = '' as $$
declare result text[];
begin
  if payload -> field is null then return '{}'; end if;
  if jsonb_typeof(payload -> field) <> 'array' then raise exception 'Invalid list: %', field; end if;
  if jsonb_array_length(payload -> field) > 20 or exists (
    select 1 from jsonb_array_elements(payload -> field) item
    where jsonb_typeof(item) <> 'string' or char_length(trim(item #>> '{}')) not between 1 and 40
  ) then raise exception 'Use up to 20 items of 1-40 characters for %', field; end if;
  select coalesce(array_agg(distinct trim(item)), '{}') into result from jsonb_array_elements_text(payload -> field) item;
  return result;
end;
$$;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types) values
  ('profile-avatars', 'profile-avatars', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('profile-banners', 'profile-banners', false, 10485760, array['image/jpeg', 'image/png', 'image/webp']);

create policy "owners upload profile media" on storage.objects for insert to authenticated
  with check (bucket_id in ('profile-avatars', 'profile-banners')
    and (storage.foldername(name))[1] = (select auth.uid())::text and public.can_edit_profile());
create policy "owners read profile media" on storage.objects for select to authenticated
  using (bucket_id in ('profile-avatars', 'profile-banners')
    and (storage.foldername(name))[1] = (select auth.uid())::text and public.can_edit_profile());
create policy "visitors read published profile media" on storage.objects for select
  using (exists (select 1 from public.public_profiles p where
    (storage.objects.bucket_id = 'profile-avatars' and p.avatar_path = storage.objects.name) or
    (storage.objects.bucket_id = 'profile-banners' and p.banner_path = storage.objects.name)));
create policy "owners remove unreferenced profile media" on storage.objects for delete to authenticated
  using (bucket_id in ('profile-avatars', 'profile-banners')
    and (storage.foldername(name))[1] = (select auth.uid())::text and public.can_edit_profile()
    and not exists (select 1 from public.profiles p where p.id = (select auth.uid()) and
      ((storage.objects.bucket_id = 'profile-avatars' and p.avatar_path = storage.objects.name) or
       (storage.objects.bucket_id = 'profile-banners' and p.banner_path = storage.objects.name))));

create function public.publish_developer_profile(p_details jsonb, p_revision integer)
returns void language plpgsql security definer set search_path = '' as $$
declare
  owner_id uuid := auth.uid();
  previous public.profiles;
  given_name text := trim(p_details ->> 'firstName');
  family_name text := trim(p_details ->> 'lastName');
  display_name text := trim(p_details ->> 'displayName');
  avatar text := nullif(p_details ->> 'avatarPath', '');
  banner text := nullif(p_details ->> 'bannerPath', '');
  link jsonb;
  link_position integer := 0;
  draft_revision integer;
begin
  if not public.can_edit_profile() then raise exception 'Sign in with a verified, active student account'; end if;
  select * into strict previous from public.profiles where id = owner_id for update;
  select revision into draft_revision from public.onboarding_drafts where user_id = owner_id for update;
  if coalesce(draft_revision, 0) <> p_revision then raise exception 'Your draft changed in another tab. Reload before saving.'; end if;
  if coalesce(char_length(given_name), 0) not between 1 and 40 or coalesce(char_length(family_name), 0) not between 1 and 40
    or coalesce(trim(p_details ->> 'program'), '') = '' or p_details ->> 'studyYear' is null then
    raise exception 'First name, last name, academic program and study year are required';
  end if;
  if jsonb_typeof(p_details -> 'links') is distinct from 'array' or jsonb_array_length(p_details -> 'links') > 20 then
    raise exception 'Use up to 20 links';
  end if;
  if exists (select 1 from unnest(public.profile_text_array(p_details, 'collaboration')) item
    where item not in ('Looking for teammates', 'Open to contributing to projects', 'Interested in hackathons', 'Looking for mentors', 'Willing to mentor other students')) then
    raise exception 'Invalid collaboration preference';
  end if;
  if avatar is not null and (split_part(avatar, '/', 1) <> owner_id::text or not exists (
    select 1 from storage.objects where bucket_id = 'profile-avatars' and name = avatar
  )) then raise exception 'Upload a profile picture owned by your account'; end if;
  if banner is not null and (split_part(banner, '/', 1) <> owner_id::text or not exists (
    select 1 from storage.objects where bucket_id = 'profile-banners' and name = banner
  )) then raise exception 'Upload a banner owned by your account'; end if;
  update public.profiles set
    name = coalesce(nullif(display_name, ''), left(given_name || ' ' || family_name, 80)),
    first_name = given_name, last_name = family_name,
    program = trim(p_details ->> 'program'), study_year = p_details ->> 'studyYear',
    graduation_year = nullif(p_details ->> 'graduationYear', '')::integer,
    introduction = coalesce(trim(p_details ->> 'introduction'), ''), headline = trim(p_details ->> 'headline'),
    bio = trim(p_details ->> 'bio'), skills = public.profile_text_array(p_details, 'skills'),
    languages = public.profile_text_array(p_details, 'languages'), frameworks = public.profile_text_array(p_details, 'frameworks'),
    tools = public.profile_text_array(p_details, 'tools'), interests = public.profile_text_array(p_details, 'interests'),
    preferred_roles = public.profile_text_array(p_details, 'roles'), collaboration = public.profile_text_array(p_details, 'collaboration'),
    avatar_path = avatar, banner_path = banner,
    avatar_url = case when avatar is null and previous.avatar_path is null then previous.avatar_url else null end,
    github_url = null, registered_at = coalesce(previous.registered_at, now())
    where id = owner_id;
  delete from public.profile_links where user_id = owner_id;
  for link in select * from jsonb_array_elements(p_details -> 'links') loop
    insert into public.profile_links (user_id, platform, label, value, is_public, position)
      values (owner_id, link ->> 'platform', trim(link ->> 'label'), trim(link ->> 'value'),
        coalesce((link ->> 'isPublic')::boolean, false), link_position);
    link_position := link_position + 1;
  end loop;
  delete from public.onboarding_drafts where user_id = owner_id;
end;
$$;
revoke all on function public.publish_developer_profile(jsonb, integer) from public, anon;
grant execute on function public.publish_developer_profile(jsonb, integer) to authenticated;
