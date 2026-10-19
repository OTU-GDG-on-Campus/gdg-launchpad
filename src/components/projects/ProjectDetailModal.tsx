// The in-page project detail experience. It opens over the feed without leaving it, so filters,
// search, and scroll position are all still there when it closes, and the open URL param makes
// any project directly shareable and closes cleanly with the browser Back button.

import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ErrorState, LoadingState } from '@/components/ui/PageState'
import { getProjectBySlug } from '@/lib/api/client'
import { formatRelativeTime } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'
import { BookmarkButton } from './BookmarkButton'
import { PersonTrigger } from './PersonTrigger'
import { ProjectCover } from './ProjectCover'
import { UpvoteButton } from './UpvoteButton'
import type { Project } from '@/types'

interface ProjectDetailModalProps {
  slug: string
  /** Every project the visitor has saved, so the modal can mark this one without a second call. */
  savedIds?: ReadonlySet<string>
  /** The refreshed version of a project the visitor just upvoted in the feed. */
  override?: Project
  onUpvote: (projectId: string) => void
  onToggleBookmark: (projectId: string) => void
  onClose: () => void
}

export function ProjectDetailModal({
  slug,
  savedIds,
  override,
  onUpvote,
  onToggleBookmark,
  onClose,
}: ProjectDetailModalProps) {
  const navigate = useNavigate()
  const panelRef = useRef<HTMLDivElement>(null)
  const { data, loading, error } = useAsync(() => getProjectBySlug(slug), slug)

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const project = override ?? data
  const titleId = `project-detail-${slug}`

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="border-line bg-surface shadow-card-hover relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl border outline-none sm:rounded-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close project details"
          className="border-line bg-surface/90 hover:bg-surface absolute top-4 right-4 z-10 rounded-full border p-2 backdrop-blur"
        >
          <svg viewBox="0 0 20 20" aria-hidden className="h-4 w-4 fill-current">
            <path d="M5.3 5.3a1 1 0 0 1 1.4 0L10 8.6l3.3-3.3a1 1 0 1 1 1.4 1.4L11.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 10 5.3 6.7a1 1 0 0 1 0-1.4Z" />
          </svg>
        </button>

        {error ? (
          <div className="p-6">
            <ErrorState error={error} />
          </div>
        ) : loading || !project ? (
          <div className="p-6">
            <LoadingState label="Loading project" />
          </div>
        ) : (
          <>
            <div className="relative aspect-[21/9] w-full overflow-hidden">
              <ProjectCover project={project} emphasis />
              <span className="border-line bg-surface/85 absolute top-4 left-4 rounded-full border px-3 py-1.5 text-[11px] font-semibold backdrop-blur">
                {project.category}
              </span>
            </div>

            <div className="space-y-8 p-6 sm:p-8">
              <header>
                <div className="flex flex-wrap items-center gap-2">
                  {project.openToContributions && (
                    <Badge tone="warning">Open to contributors</Badge>
                  )}
                  <span className="text-ink-muted text-xs">
                    Posted {formatRelativeTime(project.createdAt)}
                  </span>
                </div>
                <h2
                  id={titleId}
                  className="font-display mt-3 text-2xl font-bold tracking-tight sm:text-3xl"
                >
                  {project.title}
                </h2>
                <p className="text-ink-soft mt-4 leading-relaxed">{project.description}</p>
              </header>

              <section>
                <h3 className="mb-3 text-sm font-semibold">Tech stack</h3>
                <ul className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <li
                      key={tag}
                      className="border-line bg-surface-raised text-ink-soft rounded-lg border px-3 py-1.5 text-sm"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="mb-3 text-sm font-semibold">Built by</h3>
                <div className="space-y-2">
                  <PersonTrigger
                    name={project.authorName}
                    avatarUrl={project.authorAvatarUrl}
                    profileId={project.authorId}
                    headline={project.authorHeadline}
                  />
                  {project.contributors.map((contributor) => (
                    <div key={contributor.id}>
                      <PersonTrigger
                        name={contributor.name}
                        avatarUrl={contributor.avatarUrl}
                        role={contributor.role}
                        headline={contributor.role}
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              </section>

              {(project.repoUrl || project.liveUrl) && (
                <section>
                  <h3 className="mb-3 text-sm font-semibold">Links</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.repoUrl && (
                      <Button href={project.repoUrl} variant="secondary">
                        GitHub repository
                      </Button>
                    )}
                    {project.liveUrl && (
                      <Button href={project.liveUrl} variant="secondary">
                        Live demo
                      </Button>
                    )}
                  </div>
                </section>
              )}
            </div>

            <div className="border-line bg-surface/95 sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t p-4 backdrop-blur sm:px-8">
              <div className="flex items-center gap-2">
                <UpvoteButton
                  count={project.upvoteCount}
                  hasUpvoted={project.viewerHasUpvoted}
                  onToggle={() => onUpvote(project.id)}
                />
                <BookmarkButton
                  saved={savedIds?.has(project.id) ?? false}
                  onToggle={() => onToggleBookmark(project.id)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {project.openToContributions && (
                  <Button variant="secondary" onClick={() => navigate('/contribute')}>
                    Join the team
                  </Button>
                )}
                <Button onClick={() => navigate(`/projects/${project.slug}`)}>
                  Open full page
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
