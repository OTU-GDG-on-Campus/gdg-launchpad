// Private profile preview with LinkedIn, focused editing, and up to three pinned projects.

import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { AccountProjectRow } from '@/components/account/AccountProjectRow'
import { PreviewProfileEditor } from '@/components/account/PreviewProfileEditor'
import { ProfileProjectTile } from '@/components/account/ProfileProjectTile'
import { PlatformIcon } from '@/components/account/PlatformIcon'
import { ErrorState, LoadingState } from '@/components/ui/PageState'
import { Toast } from '@/components/ui/Toast'
import { getAccountWorkspace, isBackendConfigured } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/useAuth'
import { MAX_PINNED_PROJECTS } from '@/lib/profilePreview'
import { useAsync } from '@/lib/useAsync'
import type { ProfilePreview } from '@/types'

export function ProfilePage() {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState<ProfilePreview | null>(null)
  const [showSaved, setShowSaved] = useState(false)
  const editButton = useRef<HTMLButtonElement>(null)
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

  function finishEditing() {
    setEditing(false)
    requestAnimationFrame(() => editButton.current?.focus())
  }

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
                Private profile preview
              </p>
              <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.035em] break-words sm:text-5xl">
                {profile.name}
              </h1>
              <p className="text-ink-soft mt-3 text-base">
                {[profile.program, profile.year].filter(Boolean).join(' · ') ||
                  'Ontario Tech student'}
              </p>
              <p className="text-ink-muted mt-3 text-sm">
                {projects.length} published {projects.length === 1 ? 'project' : 'projects'}
              </p>
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn (opens in a new tab)"
                  className="text-brand-700 mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold hover:underline"
                >
                  <PlatformIcon platform="linkedin" />
                  LinkedIn
                </a>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  ref={editButton}
                  type="button"
                  onClick={() => setEditing(true)}
                  aria-expanded={editing}
                  aria-controls={editing ? 'profile-editor' : undefined}
                  className="bg-brand-500 text-on-brand hover:bg-brand-600 rounded-lg px-5 py-2.5 text-sm font-bold"
                >
                  Edit profile
                </button>
                <Link
                  to={`/u/${user.id}`}
                  className="border-line hover:border-brand-700 rounded-lg border px-5 py-2.5 text-sm font-semibold"
                >
                  View public profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-290 space-y-10 px-6 py-10 sm:px-11 sm:pb-24">
        <div className="border-line bg-surface text-ink-soft rounded-xl border px-5 py-4 text-sm leading-relaxed">
          <p className="font-semibold">A space to try out your profile</p>
          <p className="mt-1">
            Edits, LinkedIn, and pins here are saved only in this browser. To change your public
            page, use{' '}
            <Link to="/me/settings/profile" className="text-brand-700 underline underline-offset-4">
              public profile settings
            </Link>
            .
          </p>
        </div>
        {editing ? (
          <div id="profile-editor">
            <PreviewProfileEditor
              key={user.id}
              profile={profile}
              projects={projects}
              onSave={(next) => {
                setSaved(next)
                setShowSaved(true)
                finishEditing()
              }}
              onCancel={finishEditing}
            />
          </div>
        ) : (
          <>
            <section
              aria-labelledby="about-title"
              className="border-line bg-surface grid gap-4 rounded-xl border p-6 sm:grid-cols-[160px_1fr] sm:p-8"
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
                <div>
                  <h2 id="pinned-title" className="text-[28px] font-extrabold tracking-tight">
                    Pinned projects
                  </h2>
                  <p className="text-ink-muted mt-1 text-sm">
                    {pinned.length} of {MAX_PINNED_PROJECTS} selected. Lead with your favorite work.
                  </p>
                </div>
                {projects.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="text-brand-700 min-h-11 text-sm font-semibold hover:underline"
                  >
                    {pinned.length ? 'Manage pins' : 'Choose projects'}
                  </button>
                )}
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
                    {projects.length
                      ? 'Choose up to three published projects to keep at the top of your preview.'
                      : 'Once a project is approved, you can pin it here. Check My Projects for review status.'}
                  </p>
                </div>
              )}
            </section>
            <section aria-labelledby="recent-projects-title">
              <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
                <h2
                  id="recent-projects-title"
                  className="text-[28px] font-extrabold tracking-tight"
                >
                  Recent projects
                </h2>
                <Link
                  to="/me/projects"
                  className="text-brand-700 inline-flex min-h-11 items-center text-sm font-semibold hover:underline"
                >
                  View all my projects
                </Link>
              </div>
              <div className="border-line bg-surface overflow-hidden rounded-xl border">
                {projects.length ? (
                  projects
                    .slice(0, 6)
                    .map((project) => <AccountProjectRow key={project.id} project={project} />)
                ) : (
                  <p className="text-ink-muted p-8 text-sm">You have no published projects yet.</p>
                )}
              </div>
              {!isBackendConfigured && (
                <p className="text-ink-muted mt-3 text-xs">
                  Demo workspace: these are sample projects.
                </p>
              )}
            </section>
          </>
        )}
      </div>
      {showSaved && (
        <Toast
          message="Profile preview saved in this browser."
          onDismiss={() => setShowSaved(false)}
        />
      )}
    </div>
  )
}
