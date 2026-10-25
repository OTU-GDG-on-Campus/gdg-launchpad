// Simple project rows for private lists, with statuses and optional bookmark removal.

import { Link } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/format'
import type { Project, ProjectStatus } from '@/types'

const STATUS_LABEL: Record<ProjectStatus, string> = {
  approved: 'Published',
  pending: 'In review',
  rejected: 'Not approved',
}
const STATUS_TONE = { approved: 'success', pending: 'warning', rejected: 'neutral' } as const
interface PersonalProjectListProps {
  projects: Project[]
  showStatus?: boolean
  onRemove?: (id: string) => void
  removingId?: string | null
}

export function PersonalProjectList({
  projects,
  showStatus = false,
  onRemove,
  removingId,
}: PersonalProjectListProps) {
  return (
    <ul className="space-y-4">
      {projects.map((project) => (
        <li key={project.id} className="border-line bg-surface rounded-xl border p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-brand-700 font-mono text-xs">{project.category}</span>
            {showStatus && (
              <Badge tone={STATUS_TONE[project.status]}>{STATUS_LABEL[project.status]}</Badge>
            )}
          </div>
          <h2 className="mt-4 text-xl font-semibold tracking-tight">
            <Link className="hover:text-brand-700" to={`/projects/${project.slug}`}>
              {project.title}
            </Link>
          </h2>
          <p className="text-ink-muted mt-2 text-sm leading-relaxed">{project.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="bg-surface-raised text-ink-soft rounded-md px-2 py-1 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="border-line mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <span className="text-ink-muted text-xs">{formatDate(project.createdAt)}</span>
            {onRemove ? (
              <button
                type="button"
                disabled={Boolean(removingId)}
                onClick={() => onRemove(project.id)}
                className="text-brand-700 min-h-10 text-sm font-semibold disabled:opacity-50"
                aria-label={`Remove ${project.title} from saved projects`}
              >
                {removingId === project.id ? 'Removing...' : 'Remove from saved'}
              </button>
            ) : (
              <Link
                to={`/projects/${project.slug}`}
                className="text-brand-700 inline-flex min-h-10 items-center gap-3 text-sm font-semibold"
              >
                View project <span aria-hidden="true">&#8599;</span>
              </Link>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
