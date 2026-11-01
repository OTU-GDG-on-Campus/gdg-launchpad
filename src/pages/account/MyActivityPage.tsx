// Private timeline of existing submissions, saves, upvotes, and comments.

import { Link } from 'react-router'
import { AccountPageHeader } from '@/components/account/AccountPageHeader'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageState'
import { listMyActivity } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/useAuth'
import { formatDate } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'
import type { ActivityItem } from '@/types'

const LABELS: Record<ActivityItem['kind'], string> = {
  project: 'Submitted a project',
  bookmark: 'Saved a project',
  upvote: 'Upvoted a project',
  comment: 'Joined a discussion',
}

export function MyActivityPage() {
  const { user } = useAuth()
  const { data, loading, error } = useAsync(listMyActivity, user?.id ?? 'none')
  return (
    <>
      <AccountPageHeader
        eyebrow="Your trail"
        title="My Activity"
        description="Pick up where you left off. Recent submissions, saved projects, upvotes, and discussions, just for you."
      />
      <p className="text-ink-muted mb-6 text-xs leading-relaxed">
        Shows up to 100 recent records. Removed saves and withdrawn upvotes no longer appear.
      </p>
      {error ? (
        <ErrorState error={error} />
      ) : loading || !data ? (
        <LoadingState label="Loading activity" />
      ) : !data.length ? (
        <EmptyState
          title="Your story starts with a little curiosity"
          hint="Save or upvote a project to find it here later."
        />
      ) : (
        <ol className="border-line divide-line divide-y rounded-xl border">
          {data.map((item) => (
            <li
              key={item.id}
              className="bg-surface flex gap-4 p-5 first:rounded-t-xl last:rounded-b-xl sm:p-6"
            >
              <span
                aria-hidden="true"
                className="bg-brand-50 text-brand-700 mt-1 flex size-8 shrink-0 items-center justify-center rounded-full"
              >
                +
              </span>
              <div>
                <p className="text-ink-muted text-xs">{LABELS[item.kind]}</p>
                <Link
                  to={`/projects/${item.slug}`}
                  className="hover:text-brand-700 mt-1 inline-block font-semibold"
                >
                  {item.title}
                </Link>
                <time dateTime={item.createdAt} className="text-ink-muted mt-2 block text-xs">
                  {formatDate(item.createdAt)}
                </time>
              </div>
            </li>
          ))}
        </ol>
      )}
    </>
  )
}
