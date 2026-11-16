// Owner's public profile overview with direct access to editing, sharing, and private pin previews.

import { Link } from 'react-router'
import { AccountPageHeader } from '@/components/account/AccountPageHeader'
import { PersonalProjectList } from '@/components/account/PersonalProjectList'
import { ProfileSummary } from '@/components/account/ProfileSummary'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageState'
import { getMyProfile, listPublicProfileProjects } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/useAuth'
import { useAsync } from '@/lib/useAsync'

export function MyProfilePage() {
  const { user } = useAuth()
  const { data, loading, error } = useAsync(async () => {
    const profile = await getMyProfile()
    return { profile, projects: await listPublicProfileProjects(profile.id) }
  }, user?.id ?? 'none')
  return (
    <>
      <AccountPageHeader
        eyebrow="Meet the builder"
        title="My Profile"
        description="Your introduction to the community. Only your public details and approved projects appear on your shareable page."
      />
      <div className="mb-6 flex flex-wrap gap-4">
        <Link
          to="/me/settings/profile"
          className="bg-brand-500 text-on-brand hover:bg-brand-600 inline-flex min-h-11 items-center rounded-lg px-5 text-sm font-semibold"
        >
          Edit profile
        </Link>
        <Link
          to={`/u/${user?.id}`}
          className="border-line bg-surface inline-flex min-h-11 items-center rounded-lg border px-5 text-sm font-semibold"
        >
          View public profile
        </Link>
        <Link
          to="/profile"
          className="text-brand-700 inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-semibold hover:underline"
        >
          Preview pinned projects
        </Link>
      </div>
      {error ? (
        <ErrorState error={error} />
      ) : loading || !data ? (
        <LoadingState label="Loading profile" />
      ) : (
        <>
          <ProfileSummary profile={data.profile} />
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-xl font-semibold">Published work ({data.projects.length})</h2>
            <Link
              to="/me/projects"
              className="text-brand-700 inline-flex min-h-11 items-center text-sm font-semibold hover:underline"
            >
              Manage projects
            </Link>
          </div>
          {data.projects.length ? (
            <PersonalProjectList projects={data.projects} />
          ) : (
            <EmptyState
              title="Your work will tell the story"
              hint="Approved projects will appear here and on your public profile."
            />
          )}
        </>
      )}
    </>
  )
}
