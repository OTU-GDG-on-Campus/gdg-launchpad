// Overlapping initial circles for the people who contributed to a project.

import type { Contributor } from '@/types'

const MAX_SHOWN = 3

export function ContributorStack({ contributors }: { contributors: Contributor[] }) {
  if (contributors.length === 0) return null

  const overflow = contributors.length - MAX_SHOWN

  return (
    <div className="flex -space-x-1.5" aria-label={`${contributors.length} contributors`}>
      {contributors.slice(0, MAX_SHOWN).map((contributor) => (
        <span
          key={contributor.id}
          title={contributor.name}
          className="border-surface bg-surface-raised text-ink-muted inline-flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-semibold"
        >
          {contributor.name.charAt(0)}
        </span>
      ))}
      {overflow > 0 && (
        <span className="border-surface bg-surface-raised text-ink-muted inline-flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-semibold">
          +{overflow}
        </span>
      )}
    </div>
  )
}
