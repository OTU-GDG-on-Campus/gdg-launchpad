// One Semester Sprint card: status, theme, dates, and a link into the sprint page.

import { Link } from 'react-router'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
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
    <Card className="flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <Badge tone={STATUS_TONE[sprint.status]}>{STATUS_LABEL[sprint.status]}</Badge>
        <span className="text-ink-muted text-xs">
          {formatDateRange(sprint.startDate, sprint.endDate)}
        </span>
      </div>

      <h3 className="mt-3 font-semibold">
        <Link to={`/sprints/${sprint.slug}`} className="hover:text-brand-600">
          {sprint.title}
        </Link>
      </h3>
      <p className="text-brand-700 mt-1 text-xs font-medium">{sprint.theme}</p>
      <p className="text-ink-muted mt-2 flex-1 text-sm">{sprint.description}</p>

      <p className="text-ink-muted mt-4 text-xs">
        {formatCount(sprint.projectCount, 'project')} submitted
      </p>
    </Card>
  )
}
