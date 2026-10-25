# Profile and dashboard UI

The React pages follow the supplied profile and dashboard references using Manrope and IBM Plex
Mono from the existing design assets. The shared navbar and footer use the reference's width,
spacing, colors, and wordmark. The home hero has a full grid background. Below it and on other pages, grids stay inside cards
and panels. Featured projects use four equal cards in two columns, stacking on mobile. Dark and light themes remain supported.

Page navigation resets scrolling to the top. Changes to project filters keep the scroll position.

About content appears below the home submission prompt at /#about. It is removed from the navbar;
the footer links to the section, and the old /about route redirects there.

## Routes

- `/profile`: guarded personal profile with About me, up to three pinned projects, recent published
  projects, and an inline editor.
- `/dashboard`: guarded workspace with owned projects, real local Recently Viewed history,
  project status summaries, and a profile checklist filling the lower-left area.
- `/contributors`: public names and project counts derived from approved sample projects.
- The account name and profile icon both open `/profile`; Dashboard is beside the account links.
- Project detail pages list the creator and named contributors, including their roles.

## Persistence boundaries

`AuthProvider` and the existing Supabase authentication functions are preserved. No migrations,
credentials, environment changes, or public profile writes are included.

All project feeds still use the existing mock records. Own-project lists filter by the current
account ID rather than showing another account's sample work. Profile and dashboard routes are
UI-guarded using RequireAuth. Future protected APIs must enforce the same rules server-side.

Profile changes are explicitly labelled private previews. `saveProfilePreview` stores the name,
program, year, About me, and pinned choices in localStorage under a per-account key. The preview
does not change the navbar's auth name, publish content, or bypass the required moderator workflow.
Storage errors are reported and fields are retained for retry. Cancel discards the current form.

Project details call `recordProjectView` only for signed-in visits. History is per account,
restricted to approved records, deduplicated, newest first, and capped at eight projects. Repeat
visits move a project to the top. Dashboard Clear history removes only that account's history.
Browsing remains usable if storage is unavailable. History is not recorded for signed-out visits.

## Backend work still needed

- Replace mock project and contributor queries in client.ts with approved backend queries.
- Load approved profile fields and submit edit requests to the moderation workflow.
- Persist pinned choices and recently viewed projects if cross-device behavior is wanted.
- Add real notifications or profile-view tracking before displaying those as completed features.

The lower-left dashboard section is a profile checklist, avoiding an empty drafts section before
a project draft model and editor exist. Project activity is derived from existing record status;
it does not invent people, approvals, or collaboration events.
