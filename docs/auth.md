# Authentication

How Ontario Tech students get write access, and why the current code is not yet secure.

## The goal

Only verified Ontario Tech students may post, upvote, or comment. Everyone else can read.

We get verification for free by leaning on the university. A Google account on `ontariotechu.net`
or `ontariotechu.ca` is a Google Workspace account owned by Ontario Tech, and signing into it
redirects the student through the university portal with their student ID. If Google says the
account is on that domain, the university has already vouched for the person.

## Current state

`src/lib/auth/AuthProvider.tsx` returns a fixed demo user so the UI can be built. Nothing is
verified and nothing is secure. It exists so pages can be styled against real-looking state.

The context shape is the part that is stable. When the real flow lands, only the bodies of
`signIn` and `signOut` change, and every consumer of `useAuth` keeps working.

## The real flow

1. The browser starts Google sign-in through Supabase Auth, with the Google provider configured
   in the Supabase dashboard.
2. Pass `hd` as a query parameter on the authorization request. This makes Google's account
   chooser prefer Ontario Tech accounts. **It is a hint for the user's benefit and nothing more.**
   A caller can omit or change it.
3. Google returns an ID token. Supabase verifies its signature and creates a session.
4. A Postgres trigger on `auth.users` reads the verified email and rejects, or refuses to create a
   public profile row for, any address outside the allowed domains.
5. Row-level security policies gate every write on the existence of a non-banned profile row.

Step 4 is the actual security boundary. Steps 1 through 3 establish identity, step 4 decides who
is allowed in.

## Why the client check does not count

`isAllowedStudentEmail` in `src/lib/auth/domain.ts` and the `RequireAuth` component only hide UI.
Anyone can open devtools, or skip the site entirely and call the API directly with a token from a
personal Gmail account. If the domain rule lives only in React, a `@gmail.com` account can post.

The rule to internalize: **never trust an email address, a role, or a ban status that arrived from
the client.** Read them from the verified token or from the database, on the server, every time.

## Rules that must be enforced server-side

| Rule                      | Where it is enforced                                         |
| ------------------------- | ------------------------------------------------------------ |
| Allowed email domain      | Trigger on `auth.users`, against the verified token claim    |
| One upvote per project    | Unique constraint on `(user_id, project_id)`                 |
| Only approved is public   | RLS policy: `status = 'approved'` unless the reader is admin |
| Banned users cannot write | RLS policy checking `banned_at is null`                      |
| Admin-only actions        | RLS policy checking the profile role, not a client claim     |

## Setup checklist

Not done yet. Tracked here so whoever picks this up is not starting from a blank page.

- [ ] Create the Supabase project, save the URL and anon key into Vercel env vars
- [ ] Create a Google Cloud OAuth client, add the Supabase callback as an authorized redirect URI
- [ ] Enable the Google provider in Supabase Auth with that client ID and secret
- [ ] Write the `profiles` table and the `auth.users` trigger enforcing the domain rule
- [ ] Write RLS policies for `projects`, `upvotes`, and `comments`
- [ ] Replace the `signIn` and `signOut` bodies in `AuthProvider.tsx`
- [ ] Delete `src/lib/api/mock/users.ts`
- [ ] Test with a personal Gmail account and confirm it is rejected
