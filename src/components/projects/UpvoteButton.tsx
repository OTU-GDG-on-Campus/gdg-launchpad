// Compact upvote control used on project cards. There is no downvote by design, so the count
// only rises or is withdrawn.

import { cn } from '@/lib/cn'
import { useAuth } from '@/lib/auth/useAuth'

interface UpvoteButtonProps {
  count: number
  hasUpvoted: boolean
  onToggle: () => void
}

export function UpvoteButton({ count, hasUpvoted, onToggle }: UpvoteButtonProps) {
  const { canParticipate } = useAuth()

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={!canParticipate}
      aria-pressed={hasUpvoted}
      aria-label={`Upvote. ${count} so far`}
      title={
        canParticipate ? 'Upvote this project' : 'Sign in with your Ontario Tech account to upvote'
      }
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full text-sm transition-colors',
        hasUpvoted ? 'text-accent' : 'text-ink-muted hover:text-accent',
        !canParticipate && 'cursor-not-allowed opacity-60',
      )}
    >
      <svg viewBox="0 0 20 20" aria-hidden className="h-4 w-4 fill-current">
        <path d="M10 1a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4.6 4.4 5.2a.8.8 0 0 1-.6 1.3h-2v2.3a.8.8 0 0 1-.8.8H9a.8.8 0 0 1-.8-.8v-2.3h-2a.8.8 0 0 1-.6-1.3L10 5.6Z" />
      </svg>
      <span className="font-semibold tabular-nums">{count}</span>
    </button>
  )
}
