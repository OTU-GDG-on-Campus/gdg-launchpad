// Responsive grid or compact row list of project cards, or an empty message when there are none.

import { ProjectCard } from './ProjectCard'
import { ProjectRowCard } from './ProjectRowCard'
import { EmptyState } from '@/components/ui/PageState'
import type { Project } from '@/types'

export type ProjectView = 'grid' | 'list'

interface ProjectListProps {
  projects: Project[]
  view?: ProjectView
  /** Saves and detail actions come from the discovery feed; other pages can leave them off. */
  savedIds?: ReadonlySet<string>
  onUpvote: (projectId: string) => void
  onToggleBookmark?: (projectId: string) => void
  onOpen?: (slug: string) => void
  emptyTitle?: string
  emptyHint?: string
}

export function ProjectList({
  projects,
  view = 'grid',
  savedIds,
  onUpvote,
  onToggleBookmark,
  onOpen,
  emptyTitle = 'No projects yet',
  emptyHint = 'Be the first to post one.',
}: ProjectListProps) {
  if (projects.length === 0) return <EmptyState title={emptyTitle} hint={emptyHint} />

  if (view === 'list') {
    return (
      <div className="space-y-3">
        {projects.map((project) => (
          <ProjectRowCard
            key={project.id}
            project={project}
            saved={savedIds?.has(project.id) ?? false}
            onUpvote={onUpvote}
            onToggleBookmark={onToggleBookmark}
            onOpen={onOpen}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          lead={index === 0 && projects.length > 1}
          saved={savedIds?.has(project.id) ?? false}
          onUpvote={onUpvote}
          onToggleBookmark={onToggleBookmark}
          onOpen={onOpen}
        />
      ))}
    </div>
  )
}
