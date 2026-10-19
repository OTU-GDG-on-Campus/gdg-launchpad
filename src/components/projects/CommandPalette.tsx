// Global project search, reachable from anywhere with Ctrl+K or Cmd+K. It matches titles,
// descriptions, technologies, contributor names, and authors, then jumps straight into a
// project's detail view. Queries are debounced and stale results are dropped as the query
// changes, so an older request can never paint over a newer one.

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router'
import { Kbd } from '@/components/ui/Kbd'
import { listProjects, searchProjects } from '@/lib/api/client'
import { cn } from '@/lib/cn'
import { useAsync } from '@/lib/useAsync'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { commandKeyLabel } from '@/lib/platform'
import { ProjectCover } from './ProjectCover'
import type { Project } from '@/types'

const DEBOUNCE_MS = 180
const RESULT_LIMIT = 8

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

type PaletteItem = { kind: 'search-all' } | { kind: 'project'; project: Project }

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const trimmed = useDebouncedValue(query, DEBOUNCE_MS).trim()

  // Resetting during render is cheaper than the extra render an effect would cost.
  const [lastOpen, setLastOpen] = useState(open)
  if (open !== lastOpen) {
    setLastOpen(open)
    if (open) {
      setQuery('')
      setActiveIndex(0)
    }
  }
  const [lastTrimmed, setLastTrimmed] = useState(trimmed)
  if (trimmed !== lastTrimmed) {
    setLastTrimmed(trimmed)
    setActiveIndex(0)
  }

  const searchKey = open ? `search:${trimmed}` : 'search:closed'
  const { data: results, loading } = useAsync(
    () => (open && trimmed ? searchProjects(trimmed, RESULT_LIMIT) : Promise.resolve([])),
    searchKey,
  )
  const { data: top } = useAsync(
    () =>
      open && !trimmed
        ? listProjects({ sort: 'top', perPage: RESULT_LIMIT })
        : Promise.resolve(null),
    open && !trimmed ? 'palette-top' : 'palette-idle',
  )

  const idle = trimmed === ''
  const projects = idle ? (top?.projects ?? []) : (results ?? [])
  const items: PaletteItem[] = idle
    ? projects.map<PaletteItem>((project) => ({ kind: 'project', project }))
    : [
        { kind: 'search-all' },
        ...projects.map<PaletteItem>((project) => ({ kind: 'project', project })),
      ]

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    document
      .getElementById(`command-palette-item-${activeIndex}`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  function activate(item: PaletteItem | undefined) {
    if (!item) return
    if (item.kind === 'search-all') navigate(`/projects?q=${encodeURIComponent(trimmed)}`)
    else navigate(`/projects?open=${item.project.slug}`)
    onClose()
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) => (items.length === 0 ? 0 : (current + 1) % items.length))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) =>
        items.length === 0 ? 0 : (current - 1 + items.length) % items.length,
      )
    } else if (event.key === 'Enter') {
      event.preventDefault()
      activate(items[activeIndex])
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[12vh] sm:pt-[15vh]">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search projects"
        className="border-line bg-surface shadow-card-hover relative w-[92vw] max-w-xl overflow-hidden rounded-2xl border"
      >
        <div className="border-line flex items-center gap-3 border-b px-4">
          <svg
            viewBox="0 0 20 20"
            aria-hidden
            className="text-ink-muted h-4 w-4 shrink-0 fill-current"
          >
            <path d="M8.5 3a5.5 5.5 0 1 0 3.4 9.8l3.4 3.4a1 1 0 0 0 1.4-1.4l-3.4-3.4A5.5 5.5 0 0 0 8.5 3Zm0 2a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-results"
            aria-activedescendant={
              items[activeIndex] ? `command-palette-item-${activeIndex}` : undefined
            }
            aria-label="Search projects"
            placeholder="Search projects, technologies, builders..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            className="placeholder:text-ink-muted h-14 w-full bg-transparent text-sm outline-none"
          />
          {loading && (
            <span className="text-ink-muted animate-pulse text-xs" role="status">
              Searching...
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="text-ink-muted hover:text-ink shrink-0 rounded-md p-1 transition-colors"
          >
            <Kbd>Esc</Kbd>
          </button>
        </div>

        <ul
          id="command-palette-results"
          role="listbox"
          aria-label="Search results"
          className="max-h-[50vh] overflow-y-auto p-2"
        >
          {items.map((item, index) => (
            <li
              key={item.kind === 'search-all' ? 'search-all' : item.project.id}
              id={`command-palette-item-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => activate(item)}
              className={cn(
                'cursor-pointer rounded-lg px-2 py-2 transition-colors',
                index === activeIndex && 'bg-surface-raised',
              )}
            >
              {item.kind === 'search-all' ? (
                <span className="flex items-center gap-3 px-1 text-sm font-medium">
                  <svg
                    viewBox="0 0 20 20"
                    aria-hidden
                    className="text-ink-muted h-4 w-4 fill-current"
                  >
                    <path d="M8.5 3a5.5 5.5 0 1 0 3.4 9.8l3.4 3.4a1 1 0 0 0 1.4-1.4l-3.4-3.4A5.5 5.5 0 0 0 8.5 3Zm0 2a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z" />
                  </svg>
                  See every project matching &ldquo;{trimmed}&rdquo;
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <span className="bg-surface-raised h-10 w-16 shrink-0 overflow-hidden rounded-md">
                    <ProjectCover project={item.project} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{item.project.title}</span>
                    <span className="text-ink-muted block truncate text-xs">
                      {item.project.category} by {item.project.authorName}
                    </span>
                  </span>
                  <span className="text-ink-muted shrink-0 text-xs font-semibold tabular-nums">
                    {item.project.upvoteCount} upvotes
                  </span>
                </span>
              )}
            </li>
          ))}
          {items.length === 0 && (
            <li className="text-ink-muted px-3 py-8 text-center text-sm">
              No projects match &ldquo;{trimmed}&rdquo;. Try a technology like React or Python.
            </li>
          )}
        </ul>

        <div className="border-line text-ink-muted hidden items-center gap-3 border-t px-4 py-2 text-xs sm:flex">
          <span className="flex items-center gap-1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> to move
          </span>
          <span className="flex items-center gap-1">
            <Kbd>Enter</Kbd> to open
          </span>
          <span className="ml-auto flex items-center gap-1">
            <Kbd>{commandKeyLabel()}</Kbd>
            <Kbd>K</Kbd>
          </span>
        </div>
      </div>
    </div>
  )
}
