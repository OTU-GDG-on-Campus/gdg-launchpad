// Named project contributors, including their roles and avatar fallbacks.

import { Avatar } from '@/components/ui/Avatar'
import type { Contributor } from '@/types'

export function ContributorList({ contributors }: { contributors: Contributor[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {contributors.map((person) => (
        <li
          key={person.id}
          className="border-line bg-surface flex items-center gap-3 rounded-xl border p-4"
        >
          <Avatar name={person.name} src={person.avatarUrl} />
          <div className="min-w-0">
            <p className="text-sm font-bold">{person.name}</p>
            <p className="text-ink-muted mt-1 text-xs">{person.role || 'Contributor'}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
