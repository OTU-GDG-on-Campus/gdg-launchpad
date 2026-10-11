# AGENTS.md

Instructions for AI coding agents working in this repository. Humans should read
[CONTRIBUTING.md](CONTRIBUTING.md) first, then skim this file, since the conventions below apply
to everyone.

This file is meant to be iterated on. When you learn something that would have saved you time,
add it here in the same pass as your code change.

## What this project is

OTU LaunchPad is a public showcase for projects built by Ontario Tech University students. It is
built and maintained by GDG on Campus at Ontario Tech.

Four rules define the product. Do not quietly change them:

1. **Anyone can read.** Browsing projects requires no account.
2. **Only verified Ontario Tech students can write.** Posting, upvoting, and commenting require a
   Google sign-in on an `ontariotechu.net` or `ontariotechu.ca` account.
3. **Upvotes only.** There is no downvote anywhere in the product. The default feed ordering is
   most upvoted.
4. **This is not an official university service.** See Branding below. It is the rule most easily
   broken by accident.

Projects are reviewed by a coordinator before they appear on the public feed.

## Branding and affiliation

LaunchPad is built by a student club. It is **not** affiliated with, endorsed by, or operated by
Ontario Tech University. "OTU" appears in the name only to describe who the site is for.

Do not add anything that implies otherwise:

- **Never use an Ontario Tech logo, wordmark, crest, or official colour lockup.** The mark in
  `src/components/ui/Logo.tsx` is original art for this project. Do not replace it with the
  university's.
- **Never assign copyright to the university.** The footer credits `SITE.organization`, which is
  the club. A line like "(c) Ontario Tech University" is wrong and must not reappear.
- Do not describe LaunchPad as the university's official, premier, or sanctioned platform, or as
  run by a faculty or department.
- Keep the disclaimer in `SITE.disclaimer` rendered in the footer. Do not remove or soften it.

Describing the audience is fine: "for Ontario Tech students" and "See what Ontario Tech students
are building" are accurate and stay.

## Current state

The repository is a working skeleton. The layout, routing, and component structure are real and
typecheck clean. Data and auth are deliberately stubbed.

| Area                  | State                                                                  |
| --------------------- | ---------------------------------------------------------------------- |
| Routing and layout    | Done                                                                   |
| Home page             | Done: hero, value points, featured grid, closing call to action        |
| Dark and light themes | Done. Dark is the default, toggle persists to localStorage             |
| Project listing       | Done: category pills, search, sort, pagination. Filters in memory      |
| Project detail        | Done: cover, tech stack, screenshots slot, discussion, sidebar         |
| Semester Sprints      | Landing page, sprint cards, and detail page done                       |
| Comments              | List renders from mock data. No composer, posting is not built         |
| Upvoting              | UI done, toggles local state only                                      |
| Auth                  | Stubbed. `signIn()` returns a fixed demo user                          |
| Submission form       | Placeholder page                                                       |
| Admin panel           | Placeholder page listing planned sections                              |
| Project cover art     | Type field exists, every mock row is null so cards show a tint         |
| Backend               | Supabase project created and scaffolded. Schema written, never applied |
| Database schema       | `supabase/migrations/` holds the initial schema. Syntax checked only   |

Before starting work, re-read this table and correct it if it has drifted.

[TODO.md](TODO.md) is the full feature backlog, with priorities and a known-gaps list. Tick items
there in the same pass as the code that finishes them.

## Stack

- React 19 with TypeScript, built by Vite 8
- Tailwind CSS v4, configured in CSS via `@theme` in `src/index.css`, not a JS config file
- react-router v8, declarative `<Routes>` in `src/App.tsx`
- oxlint for linting, Prettier for formatting
- Planned backend: Supabase (Postgres, auth, storage) with Vercel serverless functions
- Deployed on Vercel

## Commands

```bash
npm install
npm run dev           # dev server on http://localhost:5173
npm run typecheck     # tsc -b
npm run lint          # oxlint
npm run format        # prettier --write .
npm run check         # typecheck + lint + format check, run this before you finish
npm run build         # production build
npm run preview       # serve the production build locally

npm run db:start      # local Supabase stack, needs Docker
npm run db:reset      # replay every migration onto a fresh local database
npm run db:diff -- <name>   # capture local schema changes as a new migration
npm run db:push       # apply pending migrations to the hosted project
npm run db:types      # regenerate src/types/database.ts
```

The `db:*` scripts need the CLI linked once with `npm run db:link`. See
[docs/supabase.md](docs/supabase.md).

`npm run check` must pass before you call a task done. It is the same gate CI runs.

## Directory map

```
src/
  App.tsx              Route table, wrapped in ThemeProvider and AuthProvider
  main.tsx             Mounts App onto #root
  index.css            Tailwind import and the @theme design tokens
  config/site.ts       Site name, nav and footer links, disclaimer, allowed email domains
  types/index.ts       Shared domain types, mirroring future DB tables
  lib/
    api/client.ts      The only seam between UI and data
    api/supabase.ts    Supabase browser client, null without env vars. Only client.ts imports it
    api/mock/          Placeholder records, deleted once the DB is live
    auth/              AuthProvider, context, useAuth hook, domain rules
    supabase/client.ts The configured Supabase browser client
    theme/             ThemeProvider, context, useTheme hook
    cn.ts              Class name joiner
    coverTint.ts       Deterministic gradient for projects with no cover image
    format.ts          Date, relative time, and count formatters
    useAsync.ts        Async loader hook with stale-result protection
  hooks/               Feature hooks that compose lib primitives
  components/
    layout/            AppShell, Navbar, Footer, ThemeToggle
    ui/                Avatar, Badge, Button, Card, FilterPills, Logo, PageHeader,
                       PageState, Pagination, SearchInput, Select
    auth/              AuthControl, RequireAuth route guard
    projects/          ProjectCard, ProjectList, ProjectSidebar, UpvoteButton,
                       ContributorStack, CommentList
    sprints/           SprintCard, SprintGrid
  pages/               One file per route

supabase/
  config.toml          Local stack config, kept in git. Comments sit inline, after the setting
  migrations/          Ordered SQL. Never edit one that has already been pushed
```

Rule of thumb for placement: if it knows about a domain type it goes in a feature folder, if it
does not it goes in `components/ui`.

## Code conventions

### File headers

Every source file opens with a short comment saying what it is for. One or two lines.

```ts
// The single seam between UI and data. Every component reads through these functions, so
// swapping mock arrays for Supabase queries touches this file and nothing else.
```

**If you change what a file does, update its header in the same edit.** A stale header is worse
than no header. This is the single most commonly skipped rule in this repo.

### Comments

Keep them to a minimum. The code should explain itself through naming and structure.

- Never more than two lines.
- Write them only for things the code genuinely cannot say: a security constraint, a deliberate
  product decision, a non-obvious tradeoff.
- A comment must stand on its own. A reader should not have to open another file to understand it.
- Never narrate what the next line does. `// loop over projects` is noise.

### No em dashes

Do not use em dashes or en dashes anywhere in this repository. Not in code, comments, strings,
JSX text, commit messages, or documentation. Use a regular hyphen surrounded by spaces, or
restructure the sentence. This applies to text rendered to users too.

### TypeScript

- No `any`. If a type is genuinely unknown use `unknown` and narrow it.
- Type imports use `import type`, required by `verbatimModuleSyntax`.
- Domain types live in `src/types/index.ts`. Props interfaces live next to their component.
- Prefer `interface` for object shapes, `type` for unions.

### Imports

Use the `@/` alias for anything outside the current folder, relative paths within a folder.

```ts
import { Button } from '@/components/ui/Button' // another folder
import { SprintCard } from './SprintCard' // same folder
```

### Components

- Named exports, except page components reached through routes, which are also named exports.
  `App.tsx` is the one default export.
- Function declarations, not arrow consts: `export function ProjectCard() {}`.
- Keep a file to one component. A tiny private helper in the same file is fine.
- Do not export both a component and a non-component from the same file. oxlint flags it and it
  breaks fast refresh.

### Styling

- Tailwind utilities in the markup. No inline `style` unless a value is computed at runtime.
- Use the semantic tokens from `@theme` in `src/index.css`: `surface-muted` (page), `surface`
  (cards), `surface-raised` (nav, footer, wells), `line`, `ink`, `ink-soft`, `ink-muted`,
  `brand-*`, `accent`, `accent-soft`, `flare`.
- **Never hardcode a raw color.** The site ships dark and light themes, and the tokens are
  redefined under `[data-theme='light']`. A literal `bg-slate-900` or `text-white` looks correct
  in one theme and broken in the other. If no token fits, add one to both blocks.
- Check both themes before you finish. The toggle is in the navbar.
- Variants belong in a lookup object at the top of the file, as in `Button.tsx` and `Badge.tsx`,
  not in a chain of ternaries inside JSX.
- Prettier sorts class strings. Do not hand-order them.

## Architectural rules

### All data access goes through `src/lib/api/client.ts`

Components and hooks never import from `lib/api/mock/` and never call `fetch` or a Supabase client
directly. The whole point of the seam is that wiring the real backend edits one file.

When you add a data function, add it to `client.ts` with its real eventual signature, even if the
body reads a mock array today.

`src/lib/supabase/client.ts` holds the one configured client instance. Only `lib/api/client.ts`
and `lib/auth/` may import it. A component importing it directly is the seam leaking.

Schema changes are SQL files in `supabase/migrations/`, never edits made in the dashboard and
left there. A dashboard edit that is not captured with `npm run db:diff` is lost on the next
`db:reset` and invisible to everyone else. See [docs/supabase.md](docs/supabase.md).

### Server-side enforcement is not optional

`isAllowedStudentEmail` in `src/lib/auth/domain.ts` and the `RequireAuth` component are user
experience only. They hide UI, they do not secure anything. A signed-out visitor can call any
endpoint directly.

Every rule that matters must also be enforced on the server:

- the email domain restriction, checked against the `hd` claim of a signature-verified Google ID
  token, never against a client-supplied email string
- one upvote per user per project, as a database unique constraint
- moderation status, so unapproved projects are never returned to non-admins
- admin role and ban checks on every write

See [docs/auth.md](docs/auth.md) for the full flow.

### Secrets

Only `VITE_`-prefixed environment variables reach the browser, and everything with that prefix is
public. Never put a service role key, client secret, or API key behind `VITE_`. Server-only values
go in Vercel project environment variables. See [.env.example](.env.example).

## Recipes

### Add a page

1. Create `src/pages/YourPage.tsx` with a header comment and a named export.
2. Add a `<Route>` to `src/App.tsx`.
3. If it needs a signed-in student, wrap the body in `<RequireAuth>`. Add `adminOnly` for admin
   pages.
4. If it should be reachable from the navbar, add it to `NAV_LINKS` in `src/config/site.ts`.

### Add a data-backed view

Use `useAsync` for a single record and `useProjectFeed` as the model for a list.

```tsx
const { data, loading, error } = useAsync(() => getSprintBySlug(slug), slug)
```

The second argument is a **key string**, not a dependency array. It must change whenever the
loader should re-run. Render `ErrorState`, then `LoadingState`, then the real content, in that
order, using the shared components in `components/ui/PageState.tsx`.

### Add a UI primitive

Put it in `src/components/ui/`. It must not import anything from `types/`, `lib/api/`, or
`lib/auth/`. If it needs to, it is a feature component and belongs elsewhere.

## Before you finish

- [ ] `npm run check` passes
- [ ] Every file you touched has an accurate header comment
- [ ] No em dashes anywhere in the diff
- [ ] Both themes still look right
- [ ] Nothing added that implies Ontario Tech runs or endorses this site
- [ ] No new comments that restate the code
- [ ] No new data access outside `lib/api/client.ts`
- [ ] Nothing secret behind a `VITE_` prefix
- [ ] Any behaviour you stubbed is stated plainly, not implied to be finished
- [ ] This file updated if a convention or the state table changed

## Things to avoid

- Adding a component library or state manager without discussing it first. The dependency list is
  short on purpose so a new contributor can read the whole thing in an afternoon.
- Adding a downvote, a score that can go negative, or a ranking that hides low-vote projects.
- Reformatting files you did not otherwise change.
- Leaving `TODO` without context. Say what is missing and what the next step is.
- Claiming a feature works when it reads from `lib/api/mock/`.
