// A pinned-project tile following the profile reference's cover, title, and mono byline layout.

import { Link } from 'react-router'
import type { Project } from '@/types'

export function ProfileProjectTile({ project }: { project: Project }) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="border-line bg-surface hover:border-brand-700 block overflow-hidden rounded-xl border transition-colors"
    >
      <div className="bg-brand-50 text-brand-700 flex aspect-[16/10] items-center justify-center overflow-hidden font-mono text-4xl font-bold">
        {project.coverImageUrl ? (
          <img src={project.coverImageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          project.title.slice(0, 2).toUpperCase()
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold tracking-tight">{project.title}</h3>
        <p className="text-ink-muted mt-2 font-mono text-[11px]">
          {project.category} · {project.upvoteCount} upvotes
        </p>
      </div>
    </Link>
  )
}
