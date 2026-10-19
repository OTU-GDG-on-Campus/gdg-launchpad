// Switches the feed between the card grid and the compact row list.

import { cn } from '@/lib/cn'
import type { ProjectView } from './ProjectList'

interface ViewToggleProps {
  view: ProjectView
  onChange: (view: ProjectView) => void
}

const ICONS: Record<ProjectView, string> = {
  grid: 'M3 3h6v6H3V3Zm8 0h6v6h-6V3ZM3 11h6v6H3v-6Zm8 0h6v6h-6v-6Z',
  list: 'M4 5h12v2H4V5Zm0 4h12v2H4V9Zm0 4h12v2H4v-2Z',
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="Project layout"
      className="border-line bg-surface inline-flex shrink-0 rounded-lg border p-0.5"
    >
      {(['grid', 'list'] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={view === option}
          title={option === 'grid' ? 'Grid view' : 'List view'}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
            view === option ? 'bg-surface-raised text-ink' : 'text-ink-muted hover:text-ink',
          )}
        >
          <svg viewBox="0 0 20 20" aria-hidden className="h-4 w-4 fill-current">
            <path d={ICONS[option]} />
          </svg>
          <span className="hidden sm:inline">{option === 'grid' ? 'Grid' : 'List'}</span>
          <span className="sr-only sm:hidden">{option === 'grid' ? 'Grid' : 'List'} view</span>
        </button>
      ))}
    </div>
  )
}
