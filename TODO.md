# TODO

Everything LaunchPad still needs, grouped by area. Checked items are done and verified.

This is the planning doc. [AGENTS.md](AGENTS.md) holds the conventions, and its Current state
table is the quick summary. Keep the two in sync.

Priority tags: **P0** blocks the December launch, **P1** is wanted soon after, **P2** is nice to
have.

## Milestone 1: public launch (December 2026)

The smallest set that makes the site real. Everything P0 below rolls up here.

- [ ] Students can sign in with an Ontario Tech Google account
- [ ] Students can submit a project
- [ ] Coordinators can approve or reject submissions
- [ ] Approved projects appear publicly and can be upvoted
- [ ] October and November sprint showcases are live

## Authentication and accounts

- [x] Auth context shape, `useAuth`, `RequireAuth` route guard
- [x] Client-side domain helper (`isAllowedStudentEmail`)
- [x] Supabase project created and scaffolded into the repo, see [docs/supabase.md](docs/supabase.md)
- [x] `profiles` table plus a trigger on `auth.users` rejecting non-OTU domains, written as a migration
- [ ] **P0** Apply the initial migration, which is syntax checked but has never been run
- [ ] **P0** Env vars set in Vercel
- [ ] **P0** Google OAuth client configured, provider enabled in Supabase
- [ ] **P0** Replace the demo session in `AuthProvider` with real Supabase sign-in
- [ ] **P0** Verify a personal Gmail account is actually rejected end to end
- [ ] **P1** Session persistence across reloads and token refresh
- [ ] **P1** Profile page: your projects, your upvotes, edit display name
- [ ] **P2** Public profile at `/u/:handle`
- [ ] **P2** Link a GitHub username to the profile

## Project submission

- [ ] **P0** Submission form: title, summary, description, tags, category, repo and live URLs
- [ ] **P0** Client and server validation, with field-level errors
- [ ] **P0** Write path in `lib/api/client.ts` plus the `projects` table
- [ ] **P0** New submissions land as `pending`, never straight to the feed
- [ ] **P1** Cover image upload to Supabase storage, with size and type limits
- [ ] **P1** Screenshot uploads, ordered, several per project
- [ ] **P1** Edit and delete your own project
- [ ] **P1** Draft state so a submission can be saved before it is finished
- [ ] **P2** Attach a submission to an active sprint at submit time
- [ ] **P2** Auto-fill title, description, and tags from a pasted GitHub URL

## Project browsing

- [x] Listing page with category filters, search, sort, and pagination
- [x] Project detail page with tech stack, screenshots, team, and discussion
- [x] Upvote control with the signed-out state handled
- [x] Default sort by upvotes, alternative sort by newest
- [ ] **P0** Real upvote persistence, one per user, enforced by a unique constraint
- [ ] **P1** Server-side search and pagination, since the current pass filters in memory
- [ ] **P1** Empty and error states verified against the real API
- [ ] **P2** Filter by tag as well as category
- [ ] **P2** Filter to only projects open to contributions
- [ ] **P2** Related projects on the detail page

## Comments

- [x] Comment list rendered on the project detail page
- [ ] **P1** Post a comment, signed-in students only
- [ ] **P1** Delete your own comment
- [ ] **P1** `comments` table with RLS
- [ ] **P2** Reply threads
- [ ] **P2** Notify the project author of a new comment

## Semester Sprints

- [x] Sprints landing page explaining the format
- [x] Sprint cards with status, dates, and submission counts
- [x] Sprint detail page listing submissions
- [ ] **P1** `sprints` table, replacing the mock records
- [ ] **P1** Team registration flow, up to 5 members
- [ ] **P1** Sprint montage embed once a sprint completes
- [ ] **P2** Certificate generation for participants
- [ ] **P2** Per-sprint leaderboard

## Admin and moderation

- [ ] **P0** Moderation queue: list pending projects, approve or reject with a reason
- [ ] **P0** Admin role check enforced in RLS, not just in the UI
- [ ] **P1** User management: search students, view their activity
- [ ] **P1** Ban and unban an account, with `banned_at` blocking every write
- [ ] **P1** Delete or unpublish a project after it has gone live
- [ ] **P1** Report a project, and a queue for handling reports
- [ ] **P2** Sprint management: create sprints, set dates, publish montage links
- [ ] **P2** Audit log of admin actions
- [ ] **P2** Basic stats: submissions per week, active students

## Platform and infrastructure

- [x] CI running typecheck, lint, format check, and build
- [x] Vercel SPA rewrite so deep links survive a refresh
- [ ] **P0** Connect the repo to Vercel, confirm preview deploys work
- [ ] **P1** Database migrations checked into the repo
- [ ] **P1** Seed script so a fresh local database is usable
- [ ] **P1** Error boundary and a real error page
- [ ] **P1** Rate limiting on submissions and comments
- [ ] **P2** Automated tests. None exist yet, start with the data layer and `useAsync`
- [ ] **P2** Analytics, privacy-respecting
- [ ] **P2** Sitemap and per-project meta tags for link previews

## Accessibility and polish

- [x] Dark and light themes with tokenised colours
- [ ] **P1** Keyboard navigation pass over filters, cards, and the upvote control
- [ ] **P1** Mobile nav. The links are hidden below `md` with nothing replacing them
- [ ] **P1** Focus management on route change, and a skip-to-content link
- [ ] **P1** Screen reader pass on the upvote button and contributor stack
- [ ] **P2** Reduced motion support if animation gets added
- [ ] **P2** Real favicon and social share image

## Legal and branding

- [ ] **P0** Confirm with Ontario Tech Communications what name and mark use is permitted
- [ ] **P0** Privacy policy page, since the site stores student accounts
- [ ] **P1** Terms of use page
- [ ] **P1** Decide whether to keep the brand blue, which is close to the university's

## Known gaps in the current code

Things a reader might mistake for finished work.

- Everything reads from `src/lib/api/mock/`. No database exists.
- `signIn()` returns a fixed demo student. Nothing is verified.
- Upvotes and filters are in-memory only and reset on reload.
- No project has a real cover image or screenshot, so tinted placeholders stand in.
- Sprint records, including the "active" Discord Bot sprint, are placeholder rows.
- Comment posting is not wired up. The list renders, the composer does not exist.
