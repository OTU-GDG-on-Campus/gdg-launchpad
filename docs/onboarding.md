# Developer onboarding

LaunchPad separates an Auth account from a completed student registration. `/register` walks through
university email, email verification, academic details, developer identity, profile images, social links,
and review. `/login` never creates accounts. Existing completed members go directly to `/me/projects`.

## Implementation

- `src/components/auth/EmailCodeForm.tsx` and `OtpInput.tsx`: shared real-email OTP flow, paste/autofill,
  keyboard focus, invalid/expired code handling, and a 60-second resend cooldown.
- `src/components/onboarding/`: academic fields, searchable/custom skills, image crop/upload controls,
  optional links, and the registration/profile editing wizard.
- `src/hooks/useOnboardingDraft.ts`: serialized autosaves, private restoration, revision conflicts,
  navigation saves, unsaved-refresh warning, and a publication barrier.
- `src/lib/onboarding.ts`, `src/lib/profileImage.ts`, and `src/config/onboarding.ts`: shared validation,
  normalization, crop calculations, and maintainable option lists.
- `src/lib/api/client.ts`: all Auth, profile, draft, link, and Storage access. It now uses the single
  existing Supabase client. The duplicate `src/lib/api/supabase.ts` client was removed.
- `src/components/account/ProfileEditor.tsx` reuses the wizard. `ProfileSummary.tsx` and
  `PlatformIcon.tsx` render public fields and public links. Account settings links to the full editor.
- Existing registration/login routes, AuthProvider, and RequireAuth retain their roles. Incomplete
  accounts redirect to registration; completed accounts and admin access retain existing guards.

## Migration and security

Apply `20261027000000_developer_onboarding.sql` after all existing migrations. It extends `profiles`
and `public_profiles`; it does not replace either. `registered_at` remains the completion marker, so
existing completed accounts do not repeat onboarding. Legacy GitHub URLs move into `profile_links`.

`onboarding_drafts` holds partial profile JSON, the current step, and an optimistic revision. Only its
verified, non-banned owner can read it. Writes use `save_onboarding_draft`, which rejects stale revisions.
Draft content is not stored in browser localStorage. Only the pending OTP email and cooldown timestamp
are held in sessionStorage; verification codes are never persisted there. Supabase maintains its normal
browser session. Autosave failures are visible and retryable. Wait for the saved indicator before closing
the page; a refresh during unsaved edits prompts before leaving.

`publish_developer_profile` locks the owner row, checks confirmed university email and ban state,
validates required fields and media ownership, saves all profile fields and links, sets `registered_at`
using server time, and clears the draft in one transaction. Any failure rolls everything back.
Direct client updates to `registered_at` are revoked. Neither RPC accepts an account ID or privileges.
The existing role/ban guard remains in force.

`profile_links` supports all listed platforms, Discord handles, multiple labeled custom websites, and
per-link public visibility. RLS limits writes to the verified owner and public reads to explicitly public
links on completed, non-banned profiles. URL checks reject unsafe protocols in both the UI and database.
Public queries explicitly filter visibility even when the viewer owns the profile.

First/last names, email, role, ban state, registration state, and drafts are excluded from `public_profiles`.
The preferred display name is public; without one, the composed first and last name becomes the display
name. All other optional developer fields are public when registration/profile publication succeeds.

## Storage

The migration creates both buckets and policies automatically. Do not make these buckets public.

| Bucket            | Maximum input size | Allowed MIME types | Crop                                             |
| ----------------- | ------------------ | ------------------ | ------------------------------------------------ |
| `profile-avatars` | 5 MiB              | JPEG, PNG, WebP    | Square with circular preview, saved at 512 x 512 |
| `profile-banners` | 10 MiB             | JPEG, PNG, WebP    | 3:1, saved at 1500 x 500                         |

Files use `<auth-user-id>/<random-uuid>.<extension>`. The browser decodes and crops images with canvas,
encodes WebP, requests a signed upload URL, and sends a real multipart upload with progress events.
Only the owner may insert into their folder. Overwrite/update access is not granted. Files become
readable by other viewers only when referenced by a completed public profile. Owner previews and public
reads use one-hour signed URLs; already issued URLs can remain usable until they expire.

Published files cannot be deleted while referenced. Replacements/removals update the profile reference
on Save profile. Failed upload attempts trigger best-effort cleanup. After successful publication,
best-effort cleanup removes up to 100 unreferenced owner files older than 24 hours per bucket. A periodic
server maintenance job for abandoned accounts is not implemented. Refresh the page to renew image URLs
after an hour. A missing avatar falls back to initials.

## Configuration

1. Apply every pending migration to a local stack first. On the hosted project, review the migration
   and apply with `npm run db:push` through your usual deployment process.
2. Set only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the frontend. No new frontend secrets
   are needed. Never expose a service-role key or Brevo SMTP credentials through `VITE_` variables.
3. Keep the Email provider, new signup, and email confirmation enabled. Set OTP length to 6, expiry
   to 600 seconds, and minimum resend interval to 60 seconds. The local TOML already contains these.
4. Keep `{{ .Token }}` in both the Confirm signup and Magic Link templates using the existing files
   in `supabase/templates/`. Add production and preview origins to the Auth URL allowlist.
5. For hosted delivery, configure Brevo SMTP at `smtp-relay.brevo.com:587`, using the Brevo SMTP login
   and SMTP key, a verified sender/domain, and suitable Auth/Brevo quotas. Confirm sender authentication
   and delivery in Brevo. Credentials belong in Supabase SMTP settings, never in browser code.
6. Confirm both private buckets have the MIME and size limits above. The global Storage limit must
   allow at least 10 MiB. Bucket ownership policies are part of the migration.

Hosted migrations, hosted email delivery, and Brevo configuration are separate deployment checks. Local
Mailpit and intercepted browser tests do not verify them.

## Test locally

Use Node 22.22 or newer, Docker Desktop, and `npm install`.

```sh
npm run db:start
npm run test:db
npm run test:onboarding:local
npm test
npx playwright install chromium
npm run test:browser
npm run check
npm run build
```

`db:reset` is available to replay migrations on a disposable local database; it deletes local data.
The local integration test refuses any API URL other than `http://127.0.0.1:54321`, gets a code from
Mailpit, tests real Auth/database/Storage requests, and leaves one test account in the local database.
It uses no service-role key and sends no email through Brevo when local SMTP is disabled as committed.

Browser tests start their own Vite server on port 5190 with explicitly intercepted Supabase transport.
They never use hosted credentials. On Windows with an existing Edge installation, set
`$env:PLAYWRIGHT_CHANNEL='msedge'` before `npm run test:browser` to avoid downloading Chromium.
These tests cover OTP input/cooldowns, step navigation, refresh restoration, optional skips, failed
completion, uploads and recovery, public link filtering, settings, mobile/light and desktop/dark layouts,
keyboard interactions, and reduced motion. CI runs unit/browser checks and the SQL tests on PRs.

For manual testing, point `.env.local` to the local Supabase URL and its public/anon key, then run
`npm run dev`. Register a new `@ontariotechu.net` address and read its code at `http://localhost:54324`.
Complete required academic fields, skip or fill the optional steps, upload/crop both images, and set one
link private. Refresh midway, finish registration, then edit details at `/me/settings/profile`. Open
`/u/<user-id>` in a signed-out browser and verify that email and private links are absent. Repeat in
both themes and with a narrow viewport. With no backend configured, only the explicitly labeled demo
account works; the signup screen never accepts fake verification codes.

## Hosted verification checklist

- Confirm the migration and buckets are present, and no profiles/drafts have been made publicly readable.
- Request a code for a real consenting student's university inbox; verify delivery, wrong/expired codes,
  resend rate limits, and returning-user login. Reject a non-university signup through Auth directly.
- Finish onboarding, refresh midway, and test session expiration/relogin and save retry behavior.
- Check profile edits, avatar/banner replacement and removal, and public/private links from a second
  signed-out browser. Attempt cross-account writes with another test student; they must be denied.
- Confirm existing completed students, admin routes, browsing, bookmarks, and upvotes still work.

No hosted configuration or migrations are applied by implementing this feature or opening its PR.
