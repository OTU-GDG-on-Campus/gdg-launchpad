// Multi-select technology chips, derived from what projects actually use. Several selected
// technologies narrow the feed to projects carrying all of them.

import { cn } from '@/lib/cn'
import type { TechnologyFacet } from '@/types'

interface TechFilterChipsProps {
  technologies: TechnologyFacet[]
  selected: string[]
  onChange: (technologies: string[]) => void
}

export function TechFilterChips({ technologies, selected, onChange }: TechFilterChipsProps) {
  const selectedKeys = new Set(selected.map((technology) => technology.toLowerCase()))

  function toggle(name: string) {
    const key = name.toLowerCase()
    if (selectedKeys.has(key)) onChange(selected.filter((tech) => tech.toLowerCase() !== key))
    else onChange([...selected, name])
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Technologies</h2>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-brand-700 hover:text-brand-600 text-sm font-medium"
          >
            Clear all
          </button>
        )}
      </div>
      <ul
        aria-label="Filter by technology"
        className="scroll-rail mt-3 flex gap-2 overflow-x-auto pb-1"
      >
        {technologies.map((facet) => {
          const active = selectedKeys.has(facet.name.toLowerCase())
          return (
            <li key={facet.name}>
              <button
                type="button"
                onClick={() => toggle(facet.name)}
                aria-pressed={active}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-brand-500 text-on-brand border-transparent'
                    : 'border-line bg-surface text-ink-soft hover:border-ink-muted hover:text-ink',
                )}
              >
                {facet.name}
                <span
                  className={cn(
                    'text-xs tabular-nums',
                    active ? 'text-on-brand/70' : 'text-ink-muted',
                  )}
                >
                  {facet.projectCount}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
