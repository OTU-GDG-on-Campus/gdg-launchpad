// Technology filter as a dropdown checklist, derived from what projects actually use. Selected
// technologies show as removable tags, and the feed keeps projects carrying all of them.

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import type { TechnologyFacet } from '@/types'

interface TechFilterMenuProps {
  technologies: TechnologyFacet[]
  selected: string[]
  onChange: (technologies: string[]) => void
}

export function TechFilterMenu({ technologies, selected, onChange }: TechFilterMenuProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const selectedKeys = new Set(selected.map((technology) => technology.toLowerCase()))
  const visible = technologies.filter((facet) =>
    facet.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  useEffect(() => {
    if (!open) return
    function outside(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    function keyboard(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', keyboard)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', keyboard)
    }
  }, [open])

  function toggle(name: string) {
    const key = name.toLowerCase()
    if (selectedKeys.has(key)) onChange(selected.filter((tech) => tech.toLowerCase() !== key))
    else onChange([...selected, name])
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div ref={ref} className="relative">
        <button
          ref={trigger}
          type="button"
          aria-expanded={open}
          aria-controls="technology-filter-menu"
          onClick={() => setOpen((current) => !current)}
          className={cn(
            'flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors',
            selected.length > 0
              ? 'border-brand-500 text-ink bg-brand-50'
              : 'border-line bg-surface text-ink-soft hover:border-ink-muted',
          )}
        >
          Technologies
          {selected.length > 0 && (
            <span className="bg-brand-500 text-on-brand inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums">
              {selected.length}
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
          <div
            id="technology-filter-menu"
            className="border-line bg-surface shadow-card-hover absolute left-0 z-40 mt-2 w-72 rounded-xl border p-2"
          >
            <input
              type="search"
              autoFocus
              aria-label="Find a technology"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a technology..."
              className="border-line bg-surface-raised text-ink placeholder:text-ink-muted focus:border-brand-500 mb-2 h-9 w-full rounded-lg border px-3 text-sm outline-none"
            />
            <ul aria-label="Filter by technology" className="max-h-72 overflow-y-auto">
              {visible.map((facet) => {
                const active = selectedKeys.has(facet.name.toLowerCase())
                return (
                  <li key={facet.name}>
                    <label className="hover:bg-surface-raised flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggle(facet.name)}
                        className="accent-brand-500 h-4 w-4"
                      />
                      <span className="flex-1 truncate">{facet.name}</span>
                      <span className="text-ink-muted text-xs tabular-nums">
                        {facet.projectCount}
                      </span>
                    </label>
                  </li>
                )
              })}
              {visible.length === 0 && (
                <li className="text-ink-muted px-3 py-2 text-sm">No matching technologies</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {selected.map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => toggle(name)}
          aria-label={`Remove ${name} filter`}
          className="bg-brand-500 text-on-brand flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
        >
          {name}
          <span aria-hidden="true">&times;</span>
        </button>
      ))}
      {selected.length > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="text-brand-700 hover:text-brand-600 text-sm font-medium"
        >
          Clear
        </button>
      )}
    </div>
  )
}
