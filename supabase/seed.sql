-- Local development seed data, replayed by `npm run db:reset` after every migration.
-- Fake people and projects only. Never apply this to the hosted project.

-- Users -----------------------------------------------------------------------------------

-- The sign-up trigger creates each profile row, so only auth.users is written here. Fixed ids
-- let the rows below refer to these people. They cannot sign in, they exist as data only.
insert into auth.users (id, email, raw_app_meta_data, raw_user_meta_data)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'amira.khan@ontariotechu.net',
    '{"provider":"google"}',
    '{"full_name":"Amira Khan"}'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'priya.raman@ontariotechu.net',
    '{"provider":"google"}',
    '{"full_name":"Priya Raman"}'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'test.admin@ontariotechu.ca',
    '{"provider":"google"}',
    '{"full_name":"Test Admin"}'
  );

update public.profiles
set headline = 'CS Year 3'
where id = '11111111-1111-4111-8111-111111111111';

update public.profiles
set headline = 'Software Engineering Year 2'
where id = '22222222-2222-4222-8222-222222222222';

-- The privilege guard rejects role changes from anyone who is not an admin, and a seed runs with
-- no signed-in user. Switching it off for this one update is how the first admin is created.
alter table public.profiles disable trigger guard_profile_privileges;

update public.profiles
set role = 'admin', headline = 'Coordinator'
where id = '33333333-3333-4333-8333-333333333333';

alter table public.profiles enable trigger guard_profile_privileges;

-- Sprint ----------------------------------------------------------------------------------

insert into public.sprints (id, slug, title, theme, description, status, start_date, end_date)
values (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'discord-bot',
  'Discord Bot Sprint',
  'Discord.js',
  'Build a Discord bot in three weeks. Workshops cover slash commands, event handling, and deploying a bot that stays online.',
  'active',
  '2026-10-05',
  '2026-10-23'
);

-- Projects --------------------------------------------------------------------------------

-- Counts are left at their defaults. The triggers on upvotes and comments fill them in.
insert into public.projects (
  id, slug, title, summary, description, category, tags, repo_url, live_url,
  author_id, sprint_id, status, open_to_contributions, created_at
)
values
  (
    'b0000000-0000-4000-8000-000000000001',
    'ridgeback-scheduler',
    'Ridgeback Scheduler',
    'Builds a conflict-free timetable from the OTU course calendar in one click.',
    'Parses the published course calendar, models section conflicts as a constraint problem, and returns every valid timetable ranked by how early the mornings start.',
    'Web App',
    '{TypeScript,React,Algorithms}',
    'https://github.com/example/ridgeback-scheduler',
    null,
    '11111111-1111-4111-8111-111111111111',
    null,
    'approved',
    true,
    now() - interval '20 days'
  ),
  (
    'b0000000-0000-4000-8000-000000000002',
    'lab-queue',
    'Lab Queue',
    'A live help queue for CS labs so TAs stop losing track of who asked first.',
    'Students join a queue from their phone, TAs claim entries, and the room screen shows live position.',
    'Web App',
    '{React,Supabase,Realtime}',
    'https://github.com/example/lab-queue',
    'https://example.com/lab-queue',
    '22222222-2222-4222-8222-222222222222',
    null,
    'approved',
    true,
    now() - interval '14 days'
  ),
  (
    'b0000000-0000-4000-8000-000000000003',
    'campus-study-bot',
    'Campus Study Bot',
    'A Discord bot that pairs students into study groups by course and schedule.',
    'Students run a slash command with their course code and free hours, and the bot posts a matched group in a private thread.',
    'AI/ML',
    '{Discord.js,Node.js,Gemini}',
    'https://github.com/example/campus-study-bot',
    null,
    '11111111-1111-4111-8111-111111111111',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'approved',
    false,
    now() - interval '6 days'
  ),
  (
    'b0000000-0000-4000-8000-000000000004',
    'shuttle-tracker',
    'Shuttle Tracker',
    'Live positions for the campus shuttle, so nobody waits in February for nothing.',
    'A small PWA that reads the shuttle feed and shows the next three arrivals at the stop nearest you.',
    'Mobile App',
    '{Svelte,PWA,Geolocation}',
    null,
    null,
    '22222222-2222-4222-8222-222222222222',
    null,
    'approved',
    true,
    now() - interval '3 days'
  ),
  (
    'b0000000-0000-4000-8000-000000000005',
    'pending-grade-planner',
    'Grade Planner',
    'Works out the mark you need on the final to reach your target grade.',
    'Enter your weights and marks so far and it shows the score you need on what is left.',
    'Web App',
    '{Vue,TypeScript}',
    'https://github.com/example/grade-planner',
    null,
    '22222222-2222-4222-8222-222222222222',
    null,
    'pending',
    false,
    now() - interval '1 day'
  );

insert into public.project_contributors (project_id, name, role)
values
  ('b0000000-0000-4000-8000-000000000001', 'Ben Osei', 'Frontend'),
  ('b0000000-0000-4000-8000-000000000001', 'Chloe Tran', 'Solver tuning'),
  ('b0000000-0000-4000-8000-000000000002', 'Dev Patel', 'Realtime');

-- Upvotes and comments --------------------------------------------------------------------

insert into public.upvotes (user_id, project_id)
values
  ('22222222-2222-4222-8222-222222222222', 'b0000000-0000-4000-8000-000000000001'),
  ('33333333-3333-4333-8333-333333333333', 'b0000000-0000-4000-8000-000000000001'),
  ('11111111-1111-4111-8111-111111111111', 'b0000000-0000-4000-8000-000000000002'),
  ('33333333-3333-4333-8333-333333333333', 'b0000000-0000-4000-8000-000000000002'),
  ('22222222-2222-4222-8222-222222222222', 'b0000000-0000-4000-8000-000000000003');

insert into public.comments (project_id, author_id, body)
values
  (
    'b0000000-0000-4000-8000-000000000001',
    '22222222-2222-4222-8222-222222222222',
    'This would have saved me so much time in first year. Does it handle co-op terms?'
  ),
  (
    'b0000000-0000-4000-8000-000000000002',
    '11111111-1111-4111-8111-111111111111',
    'Great idea. Are you open to someone helping with the TA dashboard?'
  );
