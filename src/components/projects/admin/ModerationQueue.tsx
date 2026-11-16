// Coordinator queue of pending project submissions, with approve and reject.
// Row level security rejects the writes for anyone who is not an admin, whatever this UI does.

import { useState } from 'react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ErrorState, LoadingState } from '@/components/ui/PageState'
import { listPendingProjects, reviewProject } from '@/lib/api/client'
import { formatCount, formatRelativeTime } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'
import type { Project } from '@/types'

type Decision = 'approved' | 'rejected'

const EXCERPT_LENGTH = 280

export function ModerationQueue() {
  const [version, setVersion] = useState(0)
  const queue = useAsync(() => listPendingProjects(), `moderation-${version}`)
  const [decided, setDecided] = useState<Record<string, Decision>>({})
  const [busyId, setBusyId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [problem, setProblem] = useState<{ id: string; message: string } | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const waiting = (queue.data ?? []).filter((project) => !decided[project.id])

  async function decide(project: Project, decision: Decision) {
    if (busyId) return
    setBusyId(project.id)
    setConfirmId(null)
    setProblem(null)
    try {
      await reviewProject(project.id, decision)
      setDecided((current) => ({ ...current, [project.id]: decision }))
      setNotice(`${decision === 'approved' ? 'Approved' : 'Rejected'} "${project.title}".`)
    } catch (cause) {
      setProblem({
        id: project.id,
        message: cause instanceof Error ? cause.message : 'Could not save the decision.',
      })
    } finally {
      setBusyId(null)
    }
  }

  function refresh() {
    setDecided({})
    setNotice(null)
    setProblem(null)
    setVersion((current) => current + 1)
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">Moderation queue</h2>
          <p className="text-ink-muted mt-1 text-sm">
            Approve or reject pending project submissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {queue.data && (
            <Badge tone="warning">{formatCount(waiting.length, 'project')} waiting</Badge>
          )}
          <Button size="sm" variant="secondary" onClick={refresh} disabled={queue.loading}>
            Refresh
          </Button>
        </div>
      </div>

      {notice && (
        <p role="status" className="text-accent-ink mt-3 text-sm">
          {notice}
        </p>
      )}

      <div className="mt-4">
        {queue.loading ? (
          <LoadingState label="Loading the queue" />
        ) : queue.error ? (
          <ErrorState error={queue.error} />
        ) : waiting.length === 0 ? (
          <p className="border-line bg-surface-raised text-ink-muted rounded-lg border p-4 text-sm">
            Nothing is waiting for review.
          </p>
        ) : (
          <ul className="space-y-3">
            {waiting.map((project) => (
              <li key={project.id} className="border-line bg-surface-raised rounded-lg border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-medium break-words">{project.title}</h3>
                    <p className="text-ink-muted mt-0.5 text-xs">
                      by {project.authorName}
                      {project.authorHeadline ? ` · ${project.authorHeadline}` : ''} · submitted{' '}
                      {formatRelativeTime(project.createdAt)}
                    </p>
                  </div>
                  <Link
                    to={`/projects/${project.slug}`}
                    className="text-brand-700 hover:text-flare text-sm font-medium"
                  >
                    Open
                  </Link>
                </div>

                <p className="text-ink-soft mt-3 text-sm leading-relaxed">{project.summary}</p>
                {project.description && (
                  <p className="text-ink-muted mt-2 text-sm leading-relaxed whitespace-pre-line">
                    {project.description.length > EXCERPT_LENGTH
                      ? `${project.description.slice(0, EXCERPT_LENGTH)}...`
                      : project.description}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge tone="brand">{project.category}</Badge>
                  {project.openToContributions && (
                    <Badge tone="success">Open to contributions</Badge>
                  )}
                  {project.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>

                {(project.repoUrl || project.liveUrl) && (
                  <p className="mt-3 flex flex-wrap gap-4 text-sm">
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-brand-700 hover:text-flare break-all"
                      >
                        Repository
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-brand-700 hover:text-flare break-all"
                      >
                        Live demo
                      </a>
                    )}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {confirmId === project.id ? (
                    <>
                      <span className="text-sm">Reject this project?</span>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busyId !== null}
                        onClick={() => void decide(project, 'rejected')}
                      >
                        Confirm reject
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        disabled={busyId !== null}
                        onClick={() => void decide(project, 'approved')}
                      >
                        {busyId === project.id ? 'Saving...' : 'Approve'}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busyId !== null}
                        onClick={() => setConfirmId(project.id)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {problem?.id === project.id && (
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
