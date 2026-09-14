# Architecture

Why the code is shaped the way it is, and what is planned next.

## Layers

```
pages/          Route components. Compose features, own page-level state like sort order.
components/     Presentation. Feature folders know domain types, ui/ does not.
hooks/          Feature logic that composes lib primitives.
lib/api/        The data seam. The only place that knows where data comes from.
lib/auth/       Session state and the domain rules for who counts as a student.
types/          Domain types, shaped to match the future database tables.
config/         Constants a non-developer might reasonably need to change.
```

Dependencies point downward. A page may import a component, a component may import from `lib`,
nothing in `lib` imports a component.

## The data seam

Every read and write goes through `src/lib/api/client.ts`. Today its functions return filtered
copies of arrays in `lib/api/mock/`. Their signatures are already the real ones: async, returning
domain types, taking the arguments a real query would take.

This means connecting Supabase is a change to one file rather than a change to every component.
It also means the whole UI can be built and reviewed before the backend exists, which is what
lets the platform work and the database work proceed in parallel.

The cost is that a mock lookup is instant while a real query is not, so loading states get
exercised less than they will be in production. Build them anyway.

## Why upvote state lives in a hook

`useProjectFeed` holds an override map keyed by project id. A toggle writes the updated project
into that map instead of mutating the loaded list, so the response from `toggleUpvote` is the
single source of truth for that row and the list itself stays untouched.

When the real API lands, this is also where a failed request should roll the override back.

## Why there is no state library

The app has two kinds of state: server data, which `useAsync` handles, and small bits of local
UI state like the current sort tab. Neither needs Redux or Zustand. Auth is the only genuinely
global value and React context covers it.

If server-state handling starts to hurt, the right move is a query library such as TanStack Query,
not a global store. Discuss it before adding it.

## Planned backend

Supabase for Postgres, auth, and storage, with Vercel serverless functions for anything that needs
a secret or logic the database cannot express.

Tables, roughly mirroring `src/types/index.ts`:

- `profiles` - one row per verified student, holds role and `banned_at`
- `projects` - submissions, with `status` driving the moderation queue
- `upvotes` - `(user_id, project_id)` with a unique constraint, the upvote count is derived
- `comments` - per project
- `sprints` - Semester Sprint records, with `projects.sprint_id` referencing them

Row-level security is the enforcement layer. See [auth.md](auth.md).

## Deployment

Vercel, connected to the GitHub repository.

- Pushes to `main` deploy to production
- Every pull request gets its own preview URL, so reviewers click a link instead of pulling the
  branch. This matters more than usual here, since most contributors are students reviewing on
  whatever machine they have open.
- `vercel.json` rewrites non-API paths to `index.html` so client-side routes survive a hard
  refresh. Without it, loading `/sprints` directly returns a 404.

Environment variables are set per environment in the Vercel dashboard, never committed.

## Open questions

- Cover image uploads: Supabase storage, or require an external URL to start with?
- Should sprint submissions close automatically on the end date, or does a coordinator close them?
- Do comments need moderation, or is reporting plus admin deletion enough?
