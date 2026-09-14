// Read-only discussion thread. Posting is not built yet, so no composer is rendered.

import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/PageState'
import { formatRelativeTime } from '@/lib/format'
import type { Comment } from '@/types'

export function CommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return <EmptyState title="No comments yet" hint="Be the first to say something useful." />
  }

  return (
    <ul className="space-y-3">
      {comments.map((comment) => (
        <li key={comment.id} className="border-line bg-surface flex gap-3 rounded-xl border p-4">
          <Avatar name={comment.authorName} src={comment.authorAvatarUrl} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-semibold">{comment.authorName}</p>
              <p className="text-ink-muted text-xs">{formatRelativeTime(comment.createdAt)}</p>
            </div>
            <p className="text-ink-soft mt-1 text-sm">{comment.body}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
