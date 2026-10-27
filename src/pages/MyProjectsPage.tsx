// Owned submissions with private moderation-status filters and no unfinished editing controls.

import { useState } from 'react'
import { AccountPageHeader } from '@/components/account/AccountPageHeader'
import { PersonalProjectList } from '@/components/account/PersonalProjectList'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageState'
import { listMyProjects } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/useAuth'
import { useAsync } from '@/lib/useAsync'
import { cn } from '@/lib/cn'
import type { ProjectStatus } from '@/types'

const FILTERS: { value: ProjectStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All projects' },
  { value: 'approved', label: 'Published' },
  { value: 'pending', label: 'In review' },
  { value: 'rejected', label: 'Not approved' },
]

export function MyProjectsPage() {
  const { user } = useAuth()
  const { data, loading, error } = useAsync(listMyProjects, user?.id ?? 'none')
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all')
  const projects = data?.filter((project) => filter === 'all' || project.status === filter) ?? []
  return (
    <>
      <AccountPageHeader
        eyebrow="Your work"
        title="My Projects"
        description="A place for everything you have shared, from a first submission to a published project."
      />
      <div className="border-line bg-surface-raised mb-7 rounded-xl border p-5">
        <p className="text-sm font-semibold">Keep track of what comes next.</p>
        <p className="text-ink-muted mt-2 text-sm leading-relaxed">
          Projects need coordinator approval before going public. Submission forms, editing, and
          coordinator feedback are still being built.
        </p>
      </div>
      <div
        role="group"
        aria-label="Filter your projects by status"
        className="mb-6 flex flex-wrap gap-2"
      >
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={filter === option.value}
            onClick={() => setFilter(option.value)}
            className={cn(
              'min-h-10 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
              filter === option.value
                ? 'border-brand-700 bg-brand-50 text-brand-700'
                : 'border-line bg-surface text-ink-muted hover:text-ink',
            )}
          >
            {option.label}
            {data && (
              <span className="ml-2 font-mono text-xs">
                {
                  data.filter(
                    (project) => option.value === 'all' || project.status === option.value,
                  ).length
                }
              </span>
            )}
          </button>
        ))}
      </div>
      {error ? (
        <ErrorState error={error} />
      ) : loading ? (
        <LoadingState label="Loading your projects" />
      ) : !projects.length ? (
        <EmptyState
          title={
            filter === 'all' ? 'Your next project starts here' : 'No projects with this status'
          }
          hint={
            filter === 'all'
              ? 'Your submissions will appear here when project posting becomes available.'
              : 'Choose another filter to see the rest of your work.'
          }
        />
      ) : (
        <PersonalProjectList projects={projects} showStatus />
      )}
    </>
  )
}
