// Responsive grid of sprint cards.

import { SprintCard } from './SprintCard'
import { EmptyState } from '@/components/ui/PageState'
import type { Sprint } from '@/types'

export function SprintGrid({ sprints }: { sprints: Sprint[] }) {
  if (sprints.length === 0) {
    return (
      <EmptyState title="No sprints scheduled" hint="Check back once the term calendar is set." />
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sprints.map((sprint) => (
        <SprintCard key={sprint.id} sprint={sprint} />
      ))}
    </div>
  )
}
