// Shareable builder profile containing no private account fields or unpublished projects.

import { Link, useParams } from 'react-router'
import { ProfileSummary } from '@/components/account/ProfileSummary'
import { PersonalProjectList } from '@/components/account/PersonalProjectList'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageState'
import { getPublicProfile, isBackendConfigured, listPublicProfileProjects } from '@/lib/api/client'
import { useAsync } from '@/lib/useAsync'

export function PublicProfilePage() {
  const { id = '' } = useParams()
  const { data, loading, error } = useAsync(async () => {
    const profile = await getPublicProfile(id)
    return profile ? { profile, projects: await listPublicProfileProjects(id) } : null
  }, id)
  if (error) return <ErrorState error={error} />
  if (loading) return <LoadingState label="Loading builder profile" />
  if (!data)
    return (
      <EmptyState
        title="Profile not found"
        hint="This builder does not have an available public profile."
      />
    )
  return (
    <article className="mx-auto max-w-3xl">
      {!isBackendConfigured && (
        <p className="border-line bg-accent-soft text-ink-soft mb-6 rounded-lg border p-4 text-sm">
          Demo profile. This sample builder and their projects are stored only in this browser.
        </p>
      )}
      <Link
        to="/projects"
        className="text-brand-700 mb-8 inline-flex min-h-10 items-center text-sm font-semibold"
      >
        &#8592; Explore student projects
      </Link>
      <p className="text-flare mb-3 font-mono text-xs tracking-widest uppercase">
        Meet the builder
      </p>
      <h1 className="mb-7 text-3xl font-bold tracking-tight">{data.profile.name}'s LaunchPad</h1>
      <ProfileSummary profile={data.profile} />
      <h2 className="mb-5 text-2xl font-semibold tracking-tight">Published projects</h2>
      {data.projects.length ? (
        <PersonalProjectList projects={data.projects} />
      ) : (
        <EmptyState
          title="Something new is taking shape"
          hint="This builder has no published projects yet."
        />
      )}
    </article>
  )
}
