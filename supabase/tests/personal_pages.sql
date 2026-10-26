-- Personal-page privacy and ownership checks. Run against a migrated local stack with supabase test db.

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(14);

select has_view('public', 'public_profiles', 'public profile projection exists');
select ok(not exists (
  select 1 from information_schema.columns
  where table_schema = 'public' and table_name = 'public_profiles'
    and column_name in ('email', 'role', 'banned_at', 'registered_at')
), 'public projection excludes account fields');
select ok(not has_table_privilege('anon', 'public.public_profiles', 'UPDATE'), 'anonymous visitors cannot write through public view');
select ok(not has_table_privilege('authenticated', 'public.public_profiles', 'UPDATE'), 'students cannot write through public view');
select ok(not has_table_privilege('authenticated', 'public.public_profiles', 'INSERT'), 'students cannot insert through public view');

insert into auth.users (id, email, raw_app_meta_data, raw_user_meta_data) values
  ('99999999-1111-4111-8111-111111111111', 'personal.owner@ontariotechu.net', '{"provider":"email","providers":["email"]}', '{"full_name":"Owner Test"}'),
  ('99999999-2222-4222-8222-222222222222', 'personal.other@ontariotechu.net', '{"provider":"email","providers":["email"]}', '{"full_name":"Other Test"}');
update public.profiles set program = 'Computer Science', study_year = 'Year 2', registered_at = now()
where id in ('99999999-1111-4111-8111-111111111111', '99999999-2222-4222-8222-222222222222');
insert into public.projects (id, slug, title, summary, category, author_id, status) values
  ('99999999-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'personal-test-pending', 'Private Test Project', 'A pending fixture for ownership tests.', 'Web App', '99999999-1111-4111-8111-111111111111', 'pending'),
  ('99999999-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'personal-test-public', 'Public Test Project', 'An approved fixture for ownership tests.', 'Web App', '99999999-1111-4111-8111-111111111111', 'approved');

set local role anon;
select is((select count(*) from public.profiles where id = '99999999-1111-4111-8111-111111111111'), 0::bigint, 'anonymous visitors cannot read account rows');
select is((select count(*) from public.public_profiles where id = '99999999-1111-4111-8111-111111111111'), 1::bigint, 'anonymous visitors can read safe profiles');
select is((select count(*) from public.projects where slug = 'personal-test-pending'), 0::bigint, 'pending projects are not public');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '99999999-1111-4111-8111-111111111111', true);
select is((select email from public.profiles where id = '99999999-1111-4111-8111-111111111111'), 'personal.owner@ontariotechu.net', 'owner can read their private email');
select is((select count(*) from public.profiles where id = '99999999-2222-4222-8222-222222222222'), 0::bigint, 'another student account row is hidden');
select is((select count(*) from public.projects where slug = 'personal-test-pending'), 1::bigint, 'owner can read their pending submission');
select throws_ok($$update public.profiles set role = 'admin' where id = '99999999-1111-4111-8111-111111111111'$$, '42501', 'Only an admin may change a role or ban status', 'owner cannot elevate their role');
insert into public.bookmarks (user_id, project_id) values ('99999999-1111-4111-8111-111111111111', '99999999-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
select set_config('request.jwt.claim.sub', '99999999-2222-4222-8222-222222222222', true);
select is((select count(*) from public.bookmarks where user_id = '99999999-1111-4111-8111-111111111111'), 0::bigint, 'saved lists are private across accounts');
select is((select count(*) from public.projects where slug = 'personal-test-pending'), 0::bigint, 'another student cannot read pending submissions');
reset role;
select * from finish();
rollback;
