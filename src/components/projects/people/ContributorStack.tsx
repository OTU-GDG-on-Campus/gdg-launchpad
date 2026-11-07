// Overlapping avatars for the people who contributed to a project. Each one opens a profile
// preview, since contributors are stored by name rather than by account.

import { useState } from 'react'
import { cn } from '@/lib/cn'
import { PersonPopover } from './PersonPopover'
import type { Contributor } from '@/types'

const MAX_SHOWN = 3

export function ContributorStack({ contributors }: { contributors: Contributor[] }) {
  const [openId, setOpenId] = useState<string | null>(null)

  if (contributors.length === 0) return null

  const overflow = contributors.length - MAX_SHOWN

  return (
    <div className="flex -space-x-1.5" aria-label={`${contributors.length} contributors`}>
      {contributors.slice(0, MAX_SHOWN).map((contributor) => (
        <span key={contributor.id} className="relative inline-flex">
          <button
            type="button"
            onClick={() =>
              setOpenId((current) => (current === contributor.id ? null : contributor.id))
            }
            aria-haspopup="dialog"
            aria-expanded={openId === contributor.id}
            title={`${contributor.name}${contributor.role ? `, ${contributor.role}` : ''}`}
            className={cn(
              'border-surface bg-surface-raised text-ink-muted hover:text-ink inline-flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-semibold transition-colors',
            )}
          >
            {contributor.name.charAt(0)}
          </button>
          {openId === contributor.id && (
            <PersonPopover
              name={contributor.name}
              roleOnProject={contributor.role}
              onClose={() => setOpenId(null)}
            />
          )}
        </span>
      ))}
      {overflow > 0 && (
        <span
          title={contributors
            .slice(MAX_SHOWN)
            .map((contributor) => contributor.name)
            .join(', ')}
          className="border-surface bg-surface-raised text-ink-muted inline-flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-semibold"
        >
          +{overflow}
        </span>
      )}
    </div>
  )
}
