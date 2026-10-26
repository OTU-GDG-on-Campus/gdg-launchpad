// Owner's profile preview with links to editing and the public, shareable profile.

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
          View public profile &#8599;
        </Link>
      </div>
      {error ? (
        <ErrorState error={error} />
      ) : loading || !data ? (
        <LoadingState label="Loading profile" />
      ) : (
        <>
          <ProfileSummary profile={data.profile} />
          <h2 className="mb-5 text-xl font-semibold">Published work</h2>
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
