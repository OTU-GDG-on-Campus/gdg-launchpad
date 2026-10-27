// Viewer-scoped project details and discussion with guarded upvotes and explicit write errors.

import { useLayoutEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import { CommentList } from '@/components/projects/CommentList'
import { ProjectSidebar } from '@/components/projects/ProjectSidebar'
import { Badge } from '@/components/ui/Badge'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageState'
import { getProjectBySlug, listComments, toggleUpvote } from '@/lib/api/client'
import { cn } from '@/lib/cn'
import { coverTint } from '@/lib/coverTint'
import { useAuth } from '@/lib/auth/useAuth'
import { useAsync } from '@/lib/useAsync'
import type { Project } from '@/types'

export function ProjectDetailPage() {
  const { slug = '' } = useParams()
  const { user } = useAuth()
  const viewerKey = `${slug}|${user?.id ?? 'signed-out'}`
  const activeViewer = useRef(viewerKey)
  useLayoutEffect(() => {
    activeViewer.current = viewerKey
  }, [viewerKey])
  const { data, loading, error } = useAsync(() => getProjectBySlug(slug), viewerKey)
  const comments = useAsync(
    () => listComments(data?.id ?? ''),
    `${viewerKey}|${data?.id ?? 'none'}`,
  )
  const [voteError, setVoteError] = useState<string | null>(null)
  const [overrideKey, setOverrideKey] = useState(viewerKey)
  const [override, setOverride] = useState<Project | null>(null)

  if (overrideKey !== viewerKey) {
    setOverrideKey(viewerKey)
    setOverride(null)
    setVoteError(null)
  }

  if (error) return <ErrorState error={error} />
  if (loading) return <LoadingState label="Loading project" />
  if (!data) return <EmptyState title="Project not found" />

  const project = override ?? data

  async function upvote() {
    setVoteError(null)
    try {
      const updated = await toggleUpvote(project.id)
      if (activeViewer.current === viewerKey) setOverride(updated)
    } catch (cause) {
      if (activeViewer.current === viewerKey)
        setVoteError(cause instanceof Error ? cause.message : 'Could not update your upvote.')
    }
  }

  return (
    <article className="space-y-10">
      {project.status !== 'approved' && (
        <p className="border-line bg-surface-raised rounded-lg border p-4 text-sm">
          Private submission:{' '}
          {project.status === 'pending' ? 'awaiting coordinator review' : 'not approved'}. This
          project is not on the public feed.
        </p>
      )}
      {voteError && (
        <p role="alert" className="border-danger rounded-lg border p-4 text-sm">
          {voteError}
        </p>
      )}
      {project.coverImageUrl ? (
        <img
          src={project.coverImageUrl}
          alt=""
          className="aspect-[21/9] w-full rounded-xl object-cover"
        />
      ) : (
        <div
          className={cn(
            'aspect-[21/9] w-full rounded-xl bg-gradient-to-br',
            coverTint(project.slug),
          )}
        />
      )}

      <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="space-y-10">
          <header>
            <Badge tone="success">{project.category}</Badge>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">{project.title}</h1>
            <p className="text-ink-soft mt-4 leading-relaxed">{project.description}</p>
          </header>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Tech stack</h2>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="border-line bg-surface rounded-lg border px-3 py-1.5 text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Screenshots</h2>
            {project.screenshotUrls.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {project.screenshotUrls.map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt=""
                    className="border-line aspect-[4/3] w-full rounded-lg border object-cover"
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No screenshots yet"
                hint="Screenshot uploads arrive with the submission form."
              />
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              Student discussion ({comments.data?.length ?? project.commentCount})
            </h2>
            {comments.error ? (
              <ErrorState error={comments.error} />
            ) : comments.loading ? (
              <LoadingState label="Loading discussion" />
            ) : (
              <CommentList comments={comments.data ?? []} />
            )}
          </section>
        </div>

        <ProjectSidebar project={project} onUpvote={() => void upvote()} />
      </div>
    </article>
  )
}
