# TODO

Everything LaunchPad still needs, grouped by area. Checked items are done and verified.

This is the planning doc. [AGENTS.md](AGENTS.md) holds the conventions, and its Current state
table is the quick summary. Keep the two in sync.

Priority tags: **P0** blocks the December launch, **P1** is wanted soon after, **P2** is nice to
have.

## Milestone 1: public launch (December 2026)

The smallest set that makes the site real. Everything P0 below rolls up here.

- [ ] Students can register and log in with an emailed code to an Ontario Tech address
- [ ] Students can submit a project
- [ ] Coordinators can approve or reject submissions
- [ ] Approved projects appear publicly and can be upvoted
- [ ] October and November sprint showcases are live

## Authentication and accounts

- [x] Auth context shape, `useAuth`, `RequireAuth` route guard
- [x] Client-side domain helper (`isAllowedStudentEmail`)
- [x] Supabase project created and scaffolded into the repo, see [docs/supabase.md](docs/supabase.md)
- [x] `profiles` table plus a trigger on `auth.users` rejecting non-OTU domains, written as a migration
- [x] **P0** Apply the initial migration, which is syntax checked but has never been run
- [ ] **P0** Env vars set in Vercel
- [ ] **P0** Email provider and Brevo SMTP configured in the hosted Supabase project
- [x] **P0** Replace the demo session in `AuthProvider` with real Supabase sign-in, tested on the
      local stack and not yet on the hosted project
- [x] **P0** Separate login from registration, and save name, program, year, skills, and bio
- [ ] **P0** Verify a personal Gmail account is actually rejected end to end
- [ ] **P1** Session persistence across reloads and token refresh
- [x] **P1** Private profile, My Projects, My Activity, and edit-profile page
- [x] **P2** Public profile at `/u/:id`, with a safe projection excluding account fields
- [x] **P2** Optional validated GitHub profile URL
- [x] Seven-step registration with real OTP, academic/developer fields, and review
- [x] Private resumable drafts with serialized autosave and conflicting-tab protection
- [x] Atomic profile/link persistence and server-controlled registration completion
- [x] Profile picture/banner cropping, private Storage uploads, progress, and ownership policies
- [x] Optional social links and custom websites with individual visibility and full profile editing
- [ ] Verify hosted onboarding migration, Storage policies, and Brevo email delivery end to end

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
- [x] Trending, Most Upvoted, and Recently Added tabs with URL sync
- [x] Multi-select technology filter chips with counts, plus Advanced Filters
- [x] Filter to only projects open to contributions
- [x] Grid and list views, toggled and persisted in localStorage
- [x] Clicking a project card opens its full detail page directly
- [x] Global search palette on Ctrl/Cmd+K, debounced with stale-request cancellation
- [x] Bookmarking UI, optimistic with rollback, private per user
- [x] Contributor profile previews on hover, focus, and tap
- [ ] **P0** Real upvote persistence, one per user, enforced by a unique constraint
- [ ] **P0** Apply `20261018000000_bookmarks_and_featured_projects.sql` and drop the bookmark and featured fallbacks in `client.ts`
- [ ] **P1** Server-side search and pagination, since the current pass filters in memory
- [ ] **P1** Empty and error states verified against the real API
- [ ] **P1** Featured project date range enforcement server-side, so an expired selection ends by itself
- [ ] **P2** Filter by tag as well as category (tech chips cover the stack, not free-form tags)
- [ ] **P2** Related projects on the detail page
- [ ] **P2** Trending from real 7-day upvote timestamps once the `upvotes` table exists

## Personal workspace

- [x] My Projects with status filters, Saved Projects, My Profile, profile editing, and settings
- [x] My Sprints derived from projects, private activity timeline, and notification placeholder
- [x] Responsive account navigation and signed-in avatar menu
- [x] One-click local demo student with persistent fixtures and confirmed reset
- [x] Account API regression tests and configured Supabase contract tests
- [x] Apply and verify the public-profile privacy migration on a local Supabase stack
- [ ] Run pgTAP tests for public projection privileges, private profiles, projects, and bookmarks
- [ ] Browser review of account navigation, keyboard behavior, both themes, and mobile layouts

## Comments

- [x] Comment list rendered on the project detail page
- [ ] **P1** Post a comment, signed-in students only
- [ ] **P1** Delete your own comment
- [ ] **P1** `comments` table with RLS
- [ ] **P2** Reply threads
- [ ] **P2** Notify the project author of a new comment

## Semester Sprints

- [x] Sprints landing page explaining the format
- [x] Sprint status filters with counts and category-specific empty states
- [x] Sprint cards with status, dates, and submission counts
- [x] Sprint detail page listing submissions
- [x] **P1** Supabase sprint reads with demo fallback when unconfigured
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
- [x] **P1** Database migrations checked into the repo
- [x] **P1** Seed script so a fresh local database is usable
- [ ] **P1** Error boundary and a real error page
- [ ] **P1** Rate limiting on submissions and comments
- [ ] **P2** Expand automated coverage beyond account APIs, privacy, guards, and backend contracts
- [ ] **P2** Analytics, privacy-respecting
- [ ] **P2** Sitemap and per-project meta tags for link previews

## Accessibility and polish

- [x] Dark, light, and system themes with tokenised colours, no flash on load
- [x] Reduced motion support for card and palette animations
- [x] Keyboard support on the discovery tabs, filter chips, view toggle, and search palette
- [ ] **P1** Full keyboard navigation pass over filters, cards, and the upvote control
- [ ] **P1** Mobile nav. The links are hidden below `md` with nothing replacing them
- [ ] **P1** Focus management on route change, and a skip-to-content link
- [ ] **P1** Screen reader pass on the upvote button, contributor stack, and detail modal
- [ ] **P2** Real favicon and social share image

## Legal and branding

- [ ] **P0** Confirm with Ontario Tech Communications what name and mark use is permitted
- [ ] **P0** Privacy policy page, since the site stores student accounts
- [ ] **P1** Terms of use page
- [ ] **P1** Decide whether to keep the brand blue, which is close to the university's

## Known gaps in the current code

Things a reader might mistake for finished work.

- Supabase paths now cover profiles, project and sprint reads, upvotes, comments, bookmarks, and activity.
  Apply the migrations before using a configured backend. Backend contract tests intercept transport.
- Without `VITE_SUPABASE_*`, login offers an explicit demo student. Browser-local demo sessions,
  profile edits, saves, and votes persist, but no email ownership is verified.
- The featured-project demo picker remains in-memory only. The configured path uses Supabase.
- Trending uses a derived engagement score from loaded counts, not real upvote timestamps.
- The admin Featured Project picker was never clicked in a browser, because the demo session is
  a student and `adminOnly` blocks the route.
- No project has a real cover image or screenshot, so tinted placeholders stand in.
- Sprint demo records, including the "active" Discord Bot sprint, are placeholders when unconfigured.
- Comment posting is not wired up. The list renders, the composer does not exist.
- The discovery redesign has typechecked, linted, and built, but has not been reviewed in a
  browser. Both themes and the breakpoints are unverified visually.

- The Sprints and Contribute redesigns use theme tokens but still need browser review in both
  themes and at mobile breakpoints. Sprint listings remain demonstration records.

- The personal-pages and onboarding migrations replay locally. The onboarding browser suite uses
  intercepted transport; hosted email, migration, and Storage configuration still need verification.
  Broader visual review of personal pages outside the onboarding/profile editor remains pending.
- Profile media uses one-hour signed URLs. Cleanup is best effort for unreferenced files older than
  24 hours after publication; no scheduled abandoned-account media cleanup job exists yet.
- My Sprints derives links from owned projects; it does not represent team enrollment. Notifications
  have no delivery or read-tracking backend and show an explicit unavailable state.
