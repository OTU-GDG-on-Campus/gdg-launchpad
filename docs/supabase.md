# Supabase

How the database and auth backend is wired into this repo, and what is left to do.

Read [auth.md](auth.md) first. It explains the product rules this schema exists to enforce.

## What is already here

| Piece                                      | State                                                     |
| ------------------------------------------ | --------------------------------------------------------- |
| `supabase/config.toml`                     | Local stack config. Google provider on, email signup off  |
| `supabase/migrations/*_initial_schema.sql` | Tables, triggers, and RLS policies. Never applied yet     |
| `src/lib/supabase/client.ts`               | Configured browser client, stubbed until env vars are set |
| `.github/workflows/supabase.yml`           | Replays migrations on a PR, pushes them on merge to main  |
| `npm run db:*` scripts                     | Wrappers over the Supabase CLI                            |

The migration has been checked for syntax only. **Nothing in it has been run against a real
Postgres instance.** Applying it to the local stack for the first time is the next step.

## The hosted project

The project ref is `eavnzbmsfpslwdgpjfjv`, in region `us-west-2`. The ref is public: it is the
subdomain of the API URL. Ask a club lead for dashboard access.

## One-time setup

1. Install Docker Desktop, which the local Supabase stack runs on.
2. `npm install`
3. `npm run db:link`, then paste the database password when prompted. Get it from
   Project Settings > Database, or reset it there if nobody has it.
4. Copy `.env.example` to `.env.local` and fill in:
   - `VITE_SUPABASE_URL` is `https://eavnzbmsfpslwdgpjfjv.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` is the `anon` `public` key from Project Settings > API Keys

`.env.local` is gitignored. The anon key is safe in the browser only because row-level security
is on for every table in the migration. Do not disable RLS to make a query work.

## Local development loop

```bash
npm run db:start    # local Postgres, Auth, and Studio on http://localhost:54323
npm run db:reset    # drop and replay every migration from scratch
npm run db:diff -- some_change_name   # capture Studio edits as a new migration file
npm run db:push     # apply pending migrations to the hosted project
npm run db:types    # regenerate src/types/database.ts from the linked project
```

Write schema changes as a new file in `supabase/migrations/`. Never edit a migration that has
already been pushed, since the CLI tracks which ones have run and will not replay an edited one.

## Google sign-in

Not configured yet. Order matters:

1. In Google Cloud Console, create an OAuth 2.0 client of type Web application.
2. Add `https://eavnzbmsfpslwdgpjfjv.supabase.co/auth/v1/callback` as an authorized redirect URI.
3. In the Supabase dashboard, Authentication > Providers > Google, paste the client ID and secret.
4. Add the production and Vercel preview URLs under Authentication > URL Configuration.
5. For the local stack, export `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` and
   `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` before `npm run db:start`. `config.toml` reads them by
   name so the secret never lands in git.

Then replace the `signIn` and `signOut` bodies in `src/lib/auth/AuthProvider.tsx` with
`supabase.auth.signInWithOAuth({ provider: 'google', options: { queryParams: { hd: ... } } })`.
The context shape stays exactly as it is, so no consumer changes.

Pass `hd` for the account chooser only. It is a hint a caller can strip, not a security control.

## How the domain rule is actually enforced

`public.handle_new_user()` runs on insert into `auth.users` and raises if the verified email is
not on `ontariotechu.net` or `ontariotechu.ca`. That rejects the sign-up, so no profile row and
no write access. Every write policy then requires a profile row with `banned_at is null`.

The allowed domain list is duplicated in two places that must be changed together:

- `ALLOWED_EMAIL_DOMAINS` in `src/config/site.ts`
- `public.is_allowed_student_email()` in the initial migration

Confirm it works by signing in with a personal Gmail account and watching it be refused. Until
that test has been run against the hosted project, treat the rule as unproven.

## CI secrets

The deploy job needs three repository secrets under Settings > Secrets and variables > Actions:

| Secret                  | Where to get it                                            |
| ----------------------- | ---------------------------------------------------------- |
| `SUPABASE_ACCESS_TOKEN` | Account tokens page, supabase.com/dashboard/account/tokens |
| `SUPABASE_DB_PASSWORD`  | Project Settings > Database                                |
| `SUPABASE_PROJECT_REF`  | `eavnzbmsfpslwdgpjfjv`                                     |

Until all three exist the deploy job fails on every merge to main. The PR job needs none of them.

## Still to do

- [x] Apply the initial migration to the local stack and fix whatever it catches
- [ ] Configure the Google provider, then push the migration to the hosted project
- [ ] Generate `src/types/database.ts` and type the queries in `lib/api/client.ts` against it
- [ ] Replace each mock read in `lib/api/client.ts` with a real query, one function at a time
- [ ] Storage buckets and policies for cover images and screenshots
- [x] Seed script for local development, so a fresh `db:reset` is not an empty site
