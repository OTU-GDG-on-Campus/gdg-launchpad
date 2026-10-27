// Sprints derived from owned projects; this page does not imply team enrollment exists.

import { Link } from 'react-router'
import { AccountPageHeader } from '@/components/account/AccountPageHeader'
import { SprintGrid } from '@/components/sprints/SprintGrid'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageState'
import { listMySprints } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/useAuth'
import { useAsync } from '@/lib/useAsync'

export function MySprintsPage() {
  const { user } = useAuth()
  const { data, loading, error } = useAsync(listMySprints, user?.id ?? 'none')
  return (
    <>
      <AccountPageHeader
        eyebrow="Build with a theme"
        title="My Sprints"
        description="Revisit the challenges connected to your work and find your next reason to start building."
      />
      <div className="border-line bg-surface-raised mb-7 rounded-xl border p-5">
        <h2 className="text-sm font-semibold">Sprints with your projects</h2>
        <p className="text-ink-muted mt-2 text-sm leading-relaxed">
          These are sprints linked to your projects, not team registrations. Joining teams, tracking
          membership, and certificates are not available here yet.
        </p>
      </div>
      {error ? (
        <ErrorState error={error} />
      ) : loading || !data ? (
        <LoadingState label="Loading your sprints" />
      ) : !data.length ? (
        <EmptyState
          title="A new challenge is a good beginning"
          hint="When one of your projects is linked to a sprint, that sprint will appear here."
        />
      ) : (
        <SprintGrid sprints={data} />
      )}
      <Link
        to="/sprints"
        className="text-brand-700 mt-6 inline-flex min-h-10 items-center text-sm font-semibold"
      >
        Explore all sprints &#8599;
      </Link>
    </>
  )
}
