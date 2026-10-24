# Authentication

How Ontario Tech students get write access, and where each rule is enforced.

## The goal

Only verified Ontario Tech students may post, upvote, or comment. Everyone else can read.

Verification is a code emailed to the student's university address. Only someone who can read that
inbox can enter the code, so a working code proves they own an `ontariotechu.net` or
`ontariotechu.ca` address, and the university issues those to its own students and staff.

## Current state

Email code sign-in through Supabase is built and tested on the local stack, including real emails
sent through Brevo. It has not been run against the hosted project yet.

- `supabase/migrations/` creates `profiles`, the sign-up trigger that enforces the domain rule, the
  registration columns, RLS on every table, and the `is_admin()` and `can_participate()` helpers
  that the policies on `projects`, `upvotes`, and `comments` call.
- `src/lib/api/client.ts` exposes `sendEmailCode`, `verifyEmailCode`, `saveRegistration`,
  `signOutUser`, `getCurrentUser`, and `subscribeToAuthChanges`. `AuthProvider` calls only those.
- `src/components/auth/EmailCodeForm.tsx` is the two step form used by the login and register pages.
- When `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is unset, `AuthProvider` falls back to the
  demo student in `src/lib/api/mock/users.ts`, so contributors can still run the app with no setup.

The profile editor saves a private browser-only preview; it does not change the public profile,
auth identity, or moderator queue. See [workspace-ui.md](workspace-ui.md).

## Login and registration

They are separate on purpose.

- **Register** (`/register`): verify an Ontario Tech email with a code, which creates the account,
  then fill in name, program, year, skills, and a bio. Saving sets `profiles.registered_at`.
- **Login** (`/login`): only works for an existing account. The client sends
  `shouldCreateUser: false`, so an unknown email is refused and logging in can never create one.
- A student who verifies the email but stops before saving the profile is signed in but cannot post,
  upvote, or comment, because `can_participate()` requires `registered_at`. The route guard sends
  them back to finish.

## The flow

1. The student enters an email. The client checks the domain first, for a friendly message.
2. Supabase emails a six digit code through Brevo. A new account is created only when registering.
3. The student enters the code. Supabase verifies it and creates a session.
4. A Postgres trigger on `auth.users` rejects any address outside the allowed domains. Raising
   there rolls back the new `auth.users` row, so a rejected account never exists.
5. Row-level security policies gate every write on a profile that is registered and not banned.

The emailed code proves the student owns the inbox, and the trigger decides which domains are
allowed in. **Email confirmation must stay on**, in `supabase/config.toml` and in the hosted
dashboard under Authentication > Providers > Email. Without it, anyone could sign up as an address
they do not own.

## Why the client check does not count

`isAllowedStudentEmail` in `src/lib/auth/domain.ts` and the `RequireAuth` component only hide UI.
Anyone can open devtools, or skip the site entirely and call the API directly. If the domain rule
lived only in React, a `@gmail.com` account could post.

The rule to internalize: **never trust an email address, a role, or a ban status that arrived from
the client.** Read them from the verified session or from the database, on the server, every time.

## Rules that must be enforced server-side

| Rule                      | Where it is enforced                                         |
| ------------------------- | ------------------------------------------------------------ |
| Allowed email domain      | Trigger on `auth.users`, on the address being registered     |
| Owns the inbox            | Emailed one time code, with email confirmation on            |
| Finished registration     | `can_participate()` checks `registered_at`                   |
| One upvote per project    | Unique constraint on `(user_id, project_id)`                 |
| Only approved is public   | RLS policy: `status = 'approved'` unless the reader is admin |
| Banned users cannot write | RLS policy checking `banned_at is null`                      |
| Admin-only actions        | RLS policy checking the profile role, not a client claim     |

## Setup checklist

Step by step setup lives in [supabase.md](supabase.md). This is the summary.

- [x] Create the Supabase project. Ref `eavnzbmsfpslwdgpjfjv`, region `us-west-2`
- [x] Write the `profiles` table and the `auth.users` trigger enforcing the domain rule
- [x] Write RLS policies for `projects`, `upvotes`, and `comments`
- [x] Apply the migrations to the local stack
- [x] Build email code login and registration, and test them locally with Mailpit and Brevo
- [x] Create the club Brevo account and verify the sender
- [ ] Save the URL and anon key into Vercel env vars and `.env.local`
- [ ] Hosted dashboard: enable the Email provider with Confirm email on
- [ ] Hosted dashboard: add the Brevo SMTP details and raise the email rate limit
- [ ] Hosted dashboard: paste `supabase/templates/*.html` into the Confirm signup and Magic Link
      email templates, so the email carries the code and not a link
- [ ] Hosted dashboard: add the production and Vercel preview URLs under URL Configuration
- [ ] Push the migrations to the hosted project
- [ ] Test with a personal Gmail account on the hosted project and confirm it is rejected
- [ ] Delete `src/lib/api/mock/users.ts` once the demo fallback is no longer wanted
