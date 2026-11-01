// Saves a project to the viewer's private list. Upvotes rank projects in public; bookmarks are
// only ever visible to the person who saved them, and row level security keeps them that way.

import { useAuth } from '@/lib/auth/useAuth'
import { cn } from '@/lib/cn'

interface BookmarkButtonProps {
  saved: boolean
  onToggle: () => void
  className?: string
}

export function BookmarkButton({ saved, onToggle, className }: BookmarkButtonProps) {
  const { canParticipate } = useAuth()

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={!canParticipate}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved projects' : 'Save this project'}
      title={
        canParticipate
          ? saved
            ? 'Remove from saved projects'
            : 'Save this project'
          : 'Sign in with your Ontario Tech account to save projects'
      }
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors',
        saved ? 'text-accent-ink' : 'text-ink-muted hover:text-accent-ink',
        !canParticipate && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="h-4 w-4"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z"
        />
      </svg>
    </button>
  )
}
