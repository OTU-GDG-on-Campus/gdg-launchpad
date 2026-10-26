// Linked sprint card with theme, status, dates, submission count, and a clear detail-page action.

import { Link } from 'react-router'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { formatCount, formatDateRange } from '@/lib/format'
import type { Sprint, SprintStatus } from '@/types'

const STATUS_TONE: Record<SprintStatus, BadgeTone> = {
  active: 'success',
  upcoming: 'warning',
  completed: 'neutral',
}

const STATUS_LABEL: Record<SprintStatus, string> = {
  active: 'Running now',
  upcoming: 'Upcoming',
  completed: 'Completed',
}

export function SprintCard({ sprint }: { sprint: Sprint }) {
  return (
    <Link
      to={`/sprints/${sprint.slug}`}
      className="group border-line bg-surface hover:border-brand-700 flex h-full flex-col overflow-hidden rounded-xl border transition-colors"
    >
      <div className="border-line bg-brand-50 flex flex-wrap items-center justify-between gap-3 border-b px-6 py-5">
        <span className="text-brand-700 font-mono text-xs tracking-wide">{sprint.theme}</span>
        <Badge tone={STATUS_TONE[sprint.status]}>{STATUS_LABEL[sprint.status]}</Badge>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-ink-muted text-xs leading-relaxed">
          {formatDateRange(sprint.startDate, sprint.endDate)}
        </p>
        <h3 className="group-hover:text-brand-700 mt-4 text-xl font-semibold tracking-tight transition-colors">
          {sprint.title}
        </h3>
        <p className="text-ink-muted mt-3 flex-1 text-sm leading-relaxed">{sprint.description}</p>
        <p className="text-ink-muted mt-6 text-xs">
          {formatCount(sprint.projectCount, 'project')} submitted
        </p>
        <span className="border-line text-brand-700 mt-4 flex items-center justify-between gap-3 border-t pt-4 text-sm font-semibold">
          Explore sprint <span aria-hidden="true">&#8599;</span>
        </span>
      </div>
    </Link>
  )
}
