// Trending, Most upvoted, and Recently added. Switching a tab re-sorts the feed in place while
// every other filter and the search query stay untouched.

import { useRef, type KeyboardEvent } from 'react'
import { cn } from '@/lib/cn'
import type { ProjectSort } from '@/types'

interface TabOption {
  value: ProjectSort
  label: string
}

const TABS: TabOption[] = [
  { value: 'trending', label: 'Trending' },
  { value: 'top', label: 'Most upvoted' },
  { value: 'new', label: 'Recently added' },
]

interface DiscoveryTabsProps {
  value: ProjectSort
  onChange: (sort: ProjectSort) => void
}

export function DiscoveryTabs({ value, onChange }: DiscoveryTabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const activeIndex = Math.max(
    0,
    TABS.findIndex((tab) => tab.value === value),
  )

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    const delta = event.key === 'ArrowRight' ? 1 : -1
    const next = (activeIndex + delta + TABS.length) % TABS.length
    onChange(TABS[next].value)
    tabRefs.current[next]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label="Discovery order"
      onKeyDown={onKeyDown}
      className="scroll-rail border-line flex gap-6 overflow-x-auto border-b"
    >
      {TABS.map((tab, index) => (
        <button
          key={tab.value}
          ref={(node) => {
            tabRefs.current[index] = node
          }}
          type="button"
          role="tab"
          aria-selected={tab.value === value}
          tabIndex={tab.value === value ? 0 : -1}
          onClick={() => onChange(tab.value)}
          className={cn(
            'border-b-2 px-1 pb-3 text-sm font-medium whitespace-nowrap transition-colors',
            tab.value === value
              ? 'border-accent text-ink'
              : 'text-ink-muted hover:text-ink border-transparent',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
