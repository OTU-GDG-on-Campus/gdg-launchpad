// Coordinator view of the newest comments across every project, with delete.
// Row level security rejects the delete for anyone who is not an admin, whatever this UI does.

import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ErrorState, LoadingState } from '@/components/ui/PageState'
import { deleteComment, listRecentComments } from '@/lib/api/client'
import { formatRelativeTime } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'
import type { ModerationComment } from '@/types'

export function DiscussionModeration() {
  const [version, setVersion] = useState(0)
  const feed = useAsync(() => listRecentComments(50), `discussions-${version}`)
  const [removed, setRemoved] = useState<Record<string, true>>({})
  const [busyId, setBusyId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [problem, setProblem] = useState<{ id: string; message: string } | null>(null)

  const comments = (feed.data ?? []).filter((comment) => !removed[comment.id])

  async function remove(comment: ModerationComment) {
    if (busyId) return
    setBusyId(comment.id)
    setConfirmId(null)
    setProblem(null)
    try {
      await deleteComment(comment.id)
      setRemoved((current) => ({ ...current, [comment.id]: true }))
    } catch (cause) {
      setProblem({
        id: comment.id,
        message: cause instanceof Error ? cause.message : 'Could not delete the comment.',
      })
    } finally {
      setBusyId(null)
    }
  }

  function refresh() {
    setRemoved({})
    setProblem(null)
    setVersion((current) => current + 1)
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">Discussions</h2>
          <p className="text-ink-muted mt-1 text-sm">
            The newest comments on every project. Delete anything inappropriate.
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={refresh} disabled={feed.loading}>
          Refresh
        </Button>
      </div>

      <div className="mt-4">
        {feed.loading ? (
          <LoadingState label="Loading comments" />
        ) : feed.error ? (
          <ErrorState error={feed.error} />
        ) : comments.length === 0 ? (
          <p className="border-line bg-surface-raised text-ink-muted rounded-lg border p-4 text-sm">
            No comments yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {comments.map((comment) => (
              <li key={comment.id} className="border-line bg-surface-raised rounded-lg border p-4">
                <p className="text-ink-muted text-xs">
                  <span className="text-ink font-medium">{comment.authorName}</span> ·{' '}
                  {formatRelativeTime(comment.createdAt)} · on{' '}
                  {comment.projectSlug ? (
                    <Link
                      to={`/projects/${comment.projectSlug}`}
                      className="text-brand-700 hover:text-flare"
                    >
                      {comment.projectTitle}
                    </Link>
                  ) : (
                    comment.projectTitle
                  )}
                </p>
                <p className="mt-2 text-sm leading-relaxed break-words whitespace-pre-wrap">
                  {comment.body}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {confirmId === comment.id ? (
                    <>
                      <span className="text-sm">Delete this comment?</span>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busyId !== null}
                        onClick={() => void remove(comment)}
                      >
                        Confirm delete
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busyId !== null}
                      onClick={() => setConfirmId(comment.id)}
                    >
                      {busyId === comment.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  )}
                  {problem?.id === comment.id && (
                    <span role="alert" className="text-danger text-sm">
                      {problem.message}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}
