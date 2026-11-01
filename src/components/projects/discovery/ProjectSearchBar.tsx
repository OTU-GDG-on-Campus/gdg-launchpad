// Search bar on the discovery page. It opens the global search palette rather than filtering
// the feed in place.

import { Kbd } from '@/components/ui/Kbd'
import { commandKeyLabel } from '@/lib/platform'

interface ProjectSearchBarProps {
  onOpenSearch: () => void
}

export function ProjectSearchBar({ onOpenSearch }: ProjectSearchBarProps) {
  return (
    <button
      type="button"
      onClick={onOpenSearch}
      className="border-line bg-surface shadow-card hover:border-ink-muted flex h-12 w-full items-center gap-3 rounded-xl border px-4 text-left transition-colors"
    >
      <svg viewBox="0 0 20 20" aria-hidden className="text-ink-muted h-4 w-4 shrink-0 fill-current">
        <path d="M8.5 3a5.5 5.5 0 1 0 3.4 9.8l3.4 3.4a1 1 0 0 0 1.4-1.4l-3.4-3.4A5.5 5.5 0 0 0 8.5 3Zm0 2a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z" />
      </svg>
      <span className="text-ink-muted truncate text-sm">
        Search projects, technologies, builders...
      </span>
      <Kbd className="ml-auto hidden sm:inline-flex">{commandKeyLabel()} K</Kbd>
    </button>
  )
}
