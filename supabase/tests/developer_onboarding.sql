-- Real database checks for atomic completion, draft isolation, verified ownership, and media privacy.

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

insert into auth.users(id, email, email_confirmed_at, raw_user_meta_data) values
 ('88888888-1111-4111-8111-111111111111', 'onboarding.owner@ontariotechu.net', now(), '{"role":"admin"}'),
 ('88888888-2222-4222-8222-222222222222', 'onboarding.other@ontariotechu.ca', now(), '{}'),
 ('88888888-3333-4333-8333-333333333333', 'onboarding.unverified@ontariotechu.net', null, '{}');

create temporary table onboarding_fixture(payload jsonb);
insert into onboarding_fixture values ('{"firstName":"Taylor","lastName":"Chen","displayName":"Public nickname","program":"Physics","studyYear":"Graduate","links":[{"platform":"github","label":"GitHub","value":"https://github.com/taylor","isPublic":true},{"platform":"custom","label":"Private","value":"https://private.example.test","isPublic":false}]}');
grant select on onboarding_fixture to authenticated;

select is((select role::text from public.profiles where id = '88888888-1111-4111-8111-111111111111'), 'student', 'user metadata cannot grant admin privileges');
select ok(not has_column_privilege('authenticated', 'public.profiles', 'registered_at', 'UPDATE'), 'direct completion marker updates are forbidden');
select ok(not has_table_privilege('anon', 'public.onboarding_drafts', 'SELECT'), 'anonymous clients cannot query private drafts');
select ok(not exists(select 1 from information_schema.columns where table_schema = 'public' and table_name = 'public_profiles' and column_name in ('email','role','banned_at','registered_at','first_name','last_name')), 'public projection omits private names and account fields');
select is((select count(*) from storage.buckets where id in ('profile-avatars','profile-banners') and not public), 2::bigint, 'both media buckets are private');
select is((select file_size_limit from storage.buckets where id = 'profile-avatars'), 5242880::bigint, 'avatar bucket enforces 5 MB');
select is((select file_size_limit from storage.buckets where id = 'profile-banners'), 10485760::bigint, 'banner bucket enforces 10 MB');
select throws_ok($$insert into auth.users(id,email) values ('88888888-4444-4444-8444-444444444444','attacker@gmail.com')$$, '23514', 'LaunchPad accounts require an ontariotechu.net or ontariotechu.ca address', 'non-university email rejected by auth trigger');

set local role authenticated;
select set_config('request.jwt.claim.sub', '88888888-1111-4111-8111-111111111111', true);
select ok(public.can_edit_profile(), 'verified incomplete owner may edit profile');
select ok(not public.can_participate(), 'incomplete owner cannot participate');
select is(public.save_onboarding_draft((select payload from onboarding_fixture), 6, 0), 1, 'first private save returns revision one');
select is((select step from public.onboarding_drafts where user_id = auth.uid()), 6, 'step is persisted');
select throws_ok($$select public.save_onboarding_draft('{}', 3, 0)$$, 'P0001', 'Your draft changed in another tab. Reload before editing.', 'stale tabs cannot overwrite a newer draft');
insert into storage.objects(bucket_id,name) values ('profile-avatars','88888888-1111-4111-8111-111111111111/avatar.webp');
select throws_ok($$insert into storage.objects(bucket_id,name) values ('profile-avatars','88888888-2222-4222-8222-222222222222/stolen.webp')$$, '42501', 'new row violates row-level security policy for table "objects"', 'cannot upload into another user folder');
select throws_ok($$insert into public.profile_links(user_id, platform, label, value, is_public, position) values ('88888888-2222-4222-8222-222222222222','custom','Other','https://other.example.test',true,0)$$, '42501', 'new row violates row-level security policy for table "profile_links"', 'cannot insert another user link');
select throws_ok($$select public.publish_developer_profile((select payload || '{"firstName":""}'::jsonb from onboarding_fixture), 1)$$, 'P0001', 'First name, last name, academic program and study year are required', 'completion validates academic identity server-side');
select throws_ok($$select public.publish_developer_profile((select payload || '{"avatarPath":"88888888-2222-4222-8222-222222222222/stolen.webp"}'::jsonb from onboarding_fixture), 1)$$, 'P0001', 'Upload a profile picture owned by your account', 'cannot attach another user image');
select throws_ok($$select public.publish_developer_profile((select payload || '{"links":[{"platform":"custom","label":"Unsafe","value":"javascript:alert(1)","isPublic":true}]}'::jsonb from onboarding_fixture), 1)$$, '23514', null, 'unsafe protocols fail even through direct RPC calls');
select ok((select registered_at is null from public.profiles where id = auth.uid()), 'failed link insert rolls back profile completion');
select is((select count(*) from public.onboarding_drafts where user_id = auth.uid()), 1::bigint, 'failed publication retains the private draft');

select set_config('request.jwt.claim.sub', '88888888-2222-4222-8222-222222222222', true);
select is((select count(*) from public.onboarding_drafts), 0::bigint, 'another student cannot read the draft');
select is((select count(*) from storage.objects where name = '88888888-1111-4111-8111-111111111111/avatar.webp'), 0::bigint, 'unpublished media is private to its owner');

select set_config('request.jwt.claim.sub', '88888888-3333-4333-8333-333333333333', true);
select ok(not public.can_edit_profile(), 'unconfirmed email cannot edit a profile');
select throws_ok($$select public.save_onboarding_draft('{}',3,0)$$, 'P0001', 'Sign in again to save your progress', 'unconfirmed account cannot save a draft');

select set_config('request.jwt.claim.sub', '88888888-1111-4111-8111-111111111111', true);
select lives_ok($$select public.publish_developer_profile((select payload || '{"avatarPath":"88888888-1111-4111-8111-111111111111/avatar.webp"}'::jsonb from onboarding_fixture), 1)$$, 'valid profile and links publish atomically');
select ok(public.can_participate(), 'completed account can participate');
select is((select count(*) from public.onboarding_drafts where user_id = auth.uid()), 0::bigint, 'publication clears the private draft');
select is((select count(*) from public.profile_links where user_id = auth.uid()), 2::bigint, 'owner can read public and private links');
select throws_ok($$update public.profiles set role = 'admin' where id = auth.uid()$$, '42501', 'Only an admin may change a role or ban status', 'onboarding cannot escalate privileges');

reset role;
select set_config('request.jwt.claim.sub', '', true);
set local role anon;
select is((select count(*) from public.profile_links where user_id = '88888888-1111-4111-8111-111111111111'), 1::bigint, 'public query never returns private links');
select is((select name from public.public_profiles where id = '88888888-1111-4111-8111-111111111111'), 'Public nickname', 'public reads use preferred display name');
select is((select count(*) from storage.objects where name = '88888888-1111-4111-8111-111111111111/avatar.webp'), 1::bigint, 'attached published media is readable by visitors');
select is((select count(*) from public.profiles where id = '88888888-1111-4111-8111-111111111111'), 0::bigint, 'private account row stays hidden after completion');
reset role;
select * from finish();
rollback;
