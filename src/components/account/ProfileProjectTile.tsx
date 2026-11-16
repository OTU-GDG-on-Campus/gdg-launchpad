// Pinned-project link with shared cover art, a short description, and public project metadata.

import { Link } from 'react-router'
import { ProjectCover } from '@/components/projects/cards/ProjectCover'
import type { Project } from '@/types'

export function ProfileProjectTile({ project }: { project: Project }) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="border-line bg-surface hover:border-brand-700 block overflow-hidden rounded-xl border transition-colors"
    >
      <div className="aspect-[16/10] overflow-hidden">
        <ProjectCover project={project} />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold tracking-tight">{project.title}</h3>
        <p className="text-ink-soft mt-2 line-clamp-2 text-sm leading-relaxed">{project.summary}</p>
        <p className="text-ink-muted mt-2 font-mono text-[11px]">
          {project.category} · {project.upvoteCount} upvotes
        </p>
      </div>
    </Link>
  )
}
