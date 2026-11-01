// Category and contribution filters, folded away so the feed stays the focus. The panel stays
// open while a filter inside it is active.

import { useState } from 'react'
import { FilterPills } from '@/components/ui/FilterPills'
import { CATEGORY_FILTERS } from '@/config/site'
import { cn } from '@/lib/cn'
import type { ProjectCategory } from '@/types'

interface AdvancedFiltersProps {
  category: ProjectCategory | 'All'
  onCategoryChange: (category: ProjectCategory | 'All') => void
  openToContributions: boolean
  onOpenToContributionsChange: (value: boolean) => void
  onClearAll: () => void
}

export function AdvancedFilters({
  category,
  onCategoryChange,
  openToContributions,
  onOpenToContributionsChange,
  onClearAll,
}: AdvancedFiltersProps) {
  const active = category !== 'All' || openToContributions
  const [expanded, setExpanded] = useState(false)
  const open = expanded || active
  const activeCount = (category !== 'All' ? 1 : 0) + (openToContributions ? 1 : 0)

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={open}
        className={cn(
          'flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors',
          active
            ? 'border-brand-500 text-ink bg-brand-50'
            : 'border-line bg-surface text-ink-soft hover:border-ink-muted',
        )}
      >
        <svg viewBox="0 0 20 20" aria-hidden className="h-4 w-4 fill-current">
          <path d="M3 5.5A1.5 1.5 0 0 1 4.5 4h11A1.5 1.5 0 0 1 17 5.5v1A1.5 1.5 0 0 1 15.5 8h-11A1.5 1.5 0 0 1 3 6.5v-1Zm0 6A1.5 1.5 0 0 1 4.5 10h4a1.5 1.5 0 0 1 0 3h-4A1.5 1.5 0 0 1 3 11.5v-1Zm8 0a1.5 1.5 0 0 1 1.5-1h3a1.5 1.5 0 0 1 0 3h-3A1.5 1.5 0 0 1 11 11.5v-1Z" />
        </svg>
        Advanced filters
        {activeCount > 0 && (
          <span className="bg-brand-500 text-on-brand inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums">
            {activeCount}
          </span>
        )}
        <svg
          viewBox="0 0 20 20"
          aria-hidden
          className={cn('h-4 w-4 fill-current transition-transform', open && 'rotate-180')}
        >
          <path d="M5.2 7.4a1 1 0 0 1 1.4 0L10 10.8l3.4-3.4a1 1 0 1 1 1.4 1.4l-4.1 4.1a1 1 0 0 1-1.4 0L5.2 8.8a1 1 0 0 1 0-1.4Z" />
        </svg>
      </button>

      {open && (
        <div className="border-line bg-surface mt-3 space-y-5 rounded-xl border p-4 sm:p-5">
          <div>
            <h3 className="text-sm font-semibold">Project type</h3>
            <p className="text-ink-muted mt-0.5 text-xs">One category at a time.</p>
            <div className="mt-3">
              <FilterPills
                label="Filter by project type"
                options={CATEGORY_FILTERS}
                value={category}
                onChange={onCategoryChange}
              />
            </div>
          </div>

          <div className="border-line flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <div>
              <label className="flex items-center gap-2.5 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={openToContributions}
                  onChange={(event) => onOpenToContributionsChange(event.target.checked)}
                  className="accent-brand-500 h-4 w-4 rounded"
                />
                Open to contributions only
              </label>
              <p className="text-ink-muted mt-1 text-xs">
                Only show projects looking for contributors.
              </p>
            </div>
            {active && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-brand-700 hover:text-brand-600 text-sm font-medium"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
