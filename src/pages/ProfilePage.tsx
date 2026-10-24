// Signed-in profile: browser-only edits, pinned projects, and the student's recent projects.

import { useState } from 'react'
import { Link } from 'react-router'
import { AccountProjectRow } from '@/components/account/AccountProjectRow'
import { ProfileEditor } from '@/components/account/ProfileEditor'
import { ProfileProjectTile } from '@/components/account/ProfileProjectTile'
import { ErrorState, LoadingState } from '@/components/ui/PageState'
import { getAccountWorkspace } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/useAuth'
import { useAsync } from '@/lib/useAsync'
import type { ProfilePreview } from '@/types'

export function ProfilePage() {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState<ProfilePreview | null>(null)
  const workspace = useAsync(() => getAccountWorkspace(user?.id ?? ''), user?.id ?? 'signed-out')
  if (workspace.error) return <ErrorState error={workspace.error} />
  if (workspace.loading || !workspace.data || !user) return <LoadingState label="Loading profile" />
  const profile = saved?.userId === user.id ? saved : workspace.data.profile
  const projects = workspace.data.projects.filter((project) => project.status === 'approved')
  const pinned = profile.pinnedProjectIds.flatMap(
    (id) => projects.find((project) => project.id === id) ?? [],
  )
  const initials = profile.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')

  return (
    <div>
      <header className="border-line bg-surface border-b">
        <div className="mx-auto max-w-290 px-6 pt-7 pb-14 sm:px-11">
          <Link
            to="/dashboard"
            className="text-ink-soft hover:text-brand-700 text-sm font-semibold"
          >
            Back to dashboard
          </Link>
          <div className="mt-8 flex flex-wrap items-start gap-7">
            <div className="bg-brand-500 text-on-brand flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full text-3xl font-bold">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0 flex-1 basis-64">
              <p className="text-brand-700 font-mono text-[11px] tracking-widest uppercase">
                Your profile
              </p>
              <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.035em] break-words sm:text-5xl">
                {profile.name}
              </h1>
              <p className="text-ink-soft mt-3 text-base">
                {[profile.program, profile.year].filter(Boolean).join(' · ') ||
                  'Ontario Tech student'}
              </p>
              <p className="text-ink-soft mt-4 max-w-[58ch] text-base leading-relaxed">
                {profile.about ||
                  'Tell the community what you like to build. Add an About me to your profile preview.'}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="bg-brand-500 text-on-brand hover:bg-brand-600 rounded-lg px-5 py-2.5 text-sm font-bold"
                >
                  Edit profile
                </button>
                <Link
                  to="/dashboard"
                  className="border-line hover:border-brand-700 rounded-lg border px-5 py-2.5 text-sm font-semibold"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-290 space-y-10 px-6 py-10 sm:px-11 sm:pb-24">
        <p
          role="status"
          className="border-flare/30 bg-flare-soft text-ink-soft rounded-xl border px-5 py-4 text-sm leading-relaxed"
        >
          {profile.updatedAt
            ? 'Your profile preview is saved on this browser. '
            : 'You are viewing your profile preview. '}
          Edits and pinned choices here are private to this browser. Public profile updates will
          need moderator review when connected.
        </p>
        {editing && (
          <ProfileEditor
            key={user.id}
            profile={profile}
            projects={projects}
            onSave={(next) => {
              setSaved(next)
              setEditing(false)
            }}
            onCancel={() => setEditing(false)}
          />
        )}
        <section
          aria-labelledby="about-title"
          className="border-line grid gap-4 border-b pb-8 sm:grid-cols-[160px_1fr]"
        >
          <h2
            id="about-title"
            className="text-brand-700 font-mono text-xs tracking-widest uppercase"
          >
            About me
          </h2>
          <p className="text-ink-soft max-w-[66ch] text-base leading-relaxed whitespace-pre-wrap">
            {profile.about ||
              'Your About me is empty. Use Edit profile to write a short introduction.'}
          </p>
        </section>
        <section aria-labelledby="pinned-title">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="pinned-title" className="text-[28px] font-extrabold tracking-tight">
              Pinned projects
            </h2>
            <span className="text-ink-muted font-mono text-xs">{pinned.length} / 3</span>
          </div>
          {pinned.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pinned.map((project) => (
                <ProfileProjectTile key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="border-line bg-surface rounded-xl border border-dashed p-8">
              <p className="font-bold">Choose your best work</p>
              <p className="text-ink-muted mt-2 text-sm">
                Use Edit profile to pin up to three published projects.
              </p>
            </div>
          )}
        </section>
        <section aria-labelledby="recent-projects-title">
          <h2 id="recent-projects-title" className="mb-6 text-[28px] font-extrabold tracking-tight">
            Recent projects
          </h2>
          <div className="border-line bg-surface overflow-hidden rounded-xl border">
            {projects.length ? (
              projects
                .slice(0, 6)
                .map((project) => <AccountProjectRow key={project.id} project={project} />)
            ) : (
              <p className="text-ink-muted p-8 text-sm">You have no published projects yet.</p>
            )}
          </div>
          <p className="text-ink-muted mt-3 text-xs">Project listings currently use sample data.</p>
        </section>
      </div>
    </div>
  )
}
