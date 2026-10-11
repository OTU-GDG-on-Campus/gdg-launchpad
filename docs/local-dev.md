# Local development

How to run LaunchPad against a private copy of Supabase on your own machine, so nothing you try
touches the hosted project.

Read [supabase.md](supabase.md) for how the backend is wired, and [auth.md](auth.md) for the rules
the database exists to enforce.

## Why a local stack

The hosted project holds real data, and merging to `main` pushes schema changes to it
automatically. The local stack is a throwaway Postgres, Auth, and Studio running in Docker. It
replays the same migration files, so what passes here is what gets deployed.

## One-time setup

1. Install Docker Desktop and open it. Wait until the bottom left says the engine is running.
2. Install dependencies, which includes the Supabase CLI:

   ```bash
   npm install
   ```

3. Start the stack. The first run downloads several images and can take a few minutes:

   ```bash
   npm run db:start
   ```

   When it finishes it prints the Project URL, a publishable key, and the Studio address.

4. Create `.env.local` in the repo root from those printed values. The file is gitignored:

   ```
   VITE_SUPABASE_URL=http://127.0.0.1:54321
   VITE_SUPABASE_ANON_KEY=<the publishable key printed by db:start>
   ```

   If you need the values again, run `npx supabase status`.

5. Rebuild the database from the migrations plus the seed data:

   ```bash
   npm run db:reset
   ```

6. Start the app. Vite reads `.env.local` only at startup, so restart it after any change:

   ```bash
   npm run dev
   ```

## Daily use

| Command            | What it does                                                    |
| ------------------ | --------------------------------------------------------------- |
| `npm run db:start` | Start the local stack                                           |
| `npm run db:reset` | Wipe the local database, replay migrations, then load the seed  |
| `npm run db:stop`  | Stop the stack. Do this on shared networks, see the note below. |

Studio is at http://127.0.0.1:54323. Use its Table Editor to look at rows and its SQL editor to
run queries.

## Seed data

`supabase/seed.sql` runs after the migrations on every `db:reset`.

| What     | Contents                                                                     |
| -------- | ---------------------------------------------------------------------------- |
| People   | Two students and one admin, all fake, with `ontariotechu` addresses          |
| Sprint   | One active sprint, `discord-bot`                                             |
| Projects | Four approved, one pending, one of them attached to the sprint               |
| Activity | A few upvotes and comments, so the count triggers have something to total up |

Seeded people exist as data only. They cannot sign in, because the app only offers Google
sign-in and they have no Google identity.

To act as an admin yourself, sign in once with a real Google account through the local stack,
then promote that row in Studio's SQL editor:

```sql
update public.profiles set role = 'admin' where email = 'you@ontariotechu.net';
```

## Testing the sign-up rule

The domain rule lives in a trigger on `auth.users`, so you can test it in Studio's SQL editor
without Google. An Ontario Tech address should succeed:

```sql
insert into auth.users (id, email, raw_app_meta_data, raw_user_meta_data)
values (gen_random_uuid(), 'trigger.test@ontariotechu.net', '{"provider":"google"}',
        '{"full_name":"Trigger Test"}');
```

Any other domain should fail with "LaunchPad accounts require an ontariotechu.net or
ontariotechu.ca address":

```sql
insert into auth.users (id, email, raw_app_meta_data, raw_user_meta_data)
values (gen_random_uuid(), 'someone@gmail.com', '{"provider":"google"}',
        '{"full_name":"Gmail User"}');
```

Run `select email, role from public.profiles;` to see the result, and `npm run db:reset` to clear
your test rows.

## Troubleshooting

- **`'supabase' is not recognized`**: run `npm install`. The CLI is a dev dependency.
- **The first `db:start` seems stuck after the telemetry notice**: it is downloading images. Watch
  Docker Desktop's Images tab.
- **`no files matched pattern: supabase/seed.sql`**: the seed file is missing from your checkout.
  Pull the latest branch.
- **The app still shows mock data**: `.env.local` is missing or the dev server was not
  restarted. Mock data is also what the client uses whenever the variables are unset.
- **A migration fails on `db:reset`**: fix it by adding a new migration. Never edit one that has
  already been pushed to the hosted project.

## Safety notes

- The local keys and JWT secret are shared defaults printed by the CLI. They protect nothing, and
  they must never be used for the hosted project.
- Every local service binds to all network interfaces, and Studio has no login. Run
  `npm run db:stop` when you are on a shared or public network.
- Never put the hosted project's service role key in `.env.local`. This guide does not need it.
