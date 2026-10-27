# Supabase

How the database and auth backend is wired into this repo, and what is left to do.

Read [auth.md](auth.md) first. It explains the product rules this schema exists to enforce.

## What is already here

| Piece                            | State                                                                |
| -------------------------------- | -------------------------------------------------------------------- |
| `supabase/config.toml`           | Local stack config. Email code sign-in on, Brevo SMTP off by default |
| `supabase/migrations/*.sql`      | Tables, triggers, RLS, and registration columns. Applied locally     |
| `src/lib/supabase/client.ts`     | Configured browser client, stubbed until env vars are set            |
| `.github/workflows/supabase.yml` | Replays migrations on a PR, pushes them on merge to main             |
| `npm run db:*` scripts           | Wrappers over the Supabase CLI                                       |

The migrations have been applied to the local stack and tested there. They have not been pushed
to the hosted project yet.

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

## Email code sign-in

Sign-in emails a six digit code, so the Email provider is the only one in use. Order matters:

1. In the hosted dashboard, open Authentication > Providers > Email, turn it on, and keep Confirm
   email on.
2. Under Authentication > Emails > SMTP Settings, turn on custom SMTP with the Brevo details:
   host `smtp-relay.brevo.com`, port `587`, the SMTP login and key from Brevo's SMTP & API page,
   and `otu.gdsc@gmail.com` as the sender. The built in sender allows 2 emails an hour, and only to
   people on the Supabase team.
3. Raise the email rate limit under Authentication > Rate Limits.
4. Under Authentication > Emails > Templates, paste `supabase/templates/confirmation.html` into
   Confirm signup and `supabase/templates/magic_link.html` into Magic Link. They contain
   `{{ .Token }}`, which is the code. Without it the email carries a link instead.
5. Add the production and Vercel preview URLs under Authentication > URL Configuration.

Brevo SMTP keys expire after 90 days without use, so a quiet stretch can silently stop sign-in
emails.

For real emails from the local stack, copy `supabase/.env.example` to `supabase/.env`, fill in the
Brevo login and key, set `enabled = true` under `[auth.email.smtp]` in `supabase/config.toml`, and
restart the stack. Keep `enabled = false` in anything you commit. See [local-dev.md](local-dev.md).

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

The deploy job runs only when all three are set and `SUPABASE_ACCESS_TOKEN` starts with `sbp_`.
Without that configuration the deploy job is skipped, while the PR job still runs normally.

## Still to do

- [x] Apply the initial migration to the local stack and fix whatever it catches
- [ ] Configure email sign-in in the hosted project, then push the migrations to it
- [ ] Generate `src/types/database.ts` and type the queries in `lib/api/client.ts` against it
- [ ] Replace each mock read in `lib/api/client.ts` with a real query, one function at a time
- [ ] Storage buckets and policies for cover images and screenshots
- [x] Seed script for local development, so a fresh `db:reset` is not an empty site
