// Responsive grid of project cards, or an empty message when there are none.

import { ProjectCard } from './ProjectCard'
import { EmptyState } from '@/components/ui/PageState'
import type { Project } from '@/types'

interface ProjectListProps {
  projects: Project[]
  onUpvote: (projectId: string) => void
  emptyTitle?: string
  emptyHint?: string
}

export function ProjectList({
  projects,
  onUpvote,
  emptyTitle = 'No projects yet',
  emptyHint = 'Be the first to post one.',
}: ProjectListProps) {
  if (projects.length === 0) return <EmptyState title={emptyTitle} hint={emptyHint} />

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onUpvote={onUpvote} />
      ))}
    </div>
  )
}
