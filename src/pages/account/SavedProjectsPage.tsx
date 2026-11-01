// Private bookmarked projects with optimistic removal and rollback on failed writes.

import { useState } from 'react'
import { Link } from 'react-router'
import { AccountPageHeader } from '@/components/account/AccountPageHeader'
import { PersonalProjectList } from '@/components/account/PersonalProjectList'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageState'
import { listSavedProjects, removeBookmark } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/useAuth'
import { useAsync } from '@/lib/useAsync'

export function SavedProjectsPage() {
  const { user } = useAuth()
  const { data, loading, error } = useAsync(listSavedProjects, user?.id ?? 'none')
  const [removed, setRemoved] = useState<Set<string>>(new Set())
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const projects = data?.filter((project) => !removed.has(project.id)) ?? []
  async function remove(id: string) {
    if (removingId) return
    setRemovingId(id)
    setSaveError(null)
    setRemoved((current) => new Set([...current, id]))
    try {
      await removeBookmark(id)
    } catch {
      setRemoved((current) => {
        const next = new Set(current)
        next.delete(id)
        return next
      })
      setSaveError('Could not remove this saved project. Try again.')
    } finally {
      setRemovingId(null)
    }
  }
  return (
    <>
      <AccountPageHeader
        eyebrow="Keep the spark"
        title="Saved Projects"
        description="Ideas worth coming back to. Your saved list is private and ordered by when you saved each project."
      />
      <p className="text-ink-muted mb-6 text-xs leading-relaxed">
        Only projects that are still publicly available appear here.
      </p>
      {saveError && (
        <p role="alert" className="border-danger text-ink mb-5 rounded-lg border p-4 text-sm">
          {saveError}
        </p>
      )}
      {error ? (
        <ErrorState error={error} />
      ) : loading ? (
        <LoadingState label="Loading saved projects" />
      ) : !projects.length ? (
        <div className="space-y-5">
          <EmptyState
            title="Make room for your next idea"
            hint="Save projects from the gallery to collect inspiration and contribution opportunities."
          />
          <Link
            to="/projects"
            className="text-brand-700 inline-flex min-h-10 items-center text-sm font-semibold"
          >
            Explore the project gallery &#8599;
          </Link>
        </div>
      ) : (
        <PersonalProjectList
          projects={projects}
          onRemove={(id) => void remove(id)}
          removingId={removingId}
        />
      )}
    </>
  )
}
