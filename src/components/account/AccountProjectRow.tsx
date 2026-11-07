// A compact project row shared by the profile and dashboard, using real project metadata.

import { Link } from 'react-router'
import type { Project } from '@/types'

const STATUS_CLASSES: Record<Project['status'], string> = {
  approved: 'bg-accent-soft text-accent border-accent/20',
  pending: 'bg-flare-soft text-flare border-flare/20',
  rejected: 'bg-flare-soft text-flare border-flare/20',
}
const STATUS_LABELS = { approved: 'Published', pending: 'Under review', rejected: 'Needs changes' }

interface AccountProjectRowProps {
  project: Project
  detail?: string
}

export function AccountProjectRow({ project, detail }: AccountProjectRowProps) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="border-line hover:bg-surface-raised flex items-center gap-3 border-b px-4 py-4 transition-colors last:border-b-0 sm:gap-4 sm:px-5"
    >
      <span className="border-line bg-brand-50 text-brand-700 flex h-11 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border font-mono text-xs font-semibold">
        {project.coverImageUrl ? (
          <img src={project.coverImageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          project.title.slice(0, 2).toUpperCase()
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-ink block text-sm font-bold tracking-tight sm:text-[15.5px]">
          {project.title}
        </span>
        <span className="text-ink-muted mt-1 block font-mono text-[10px] leading-relaxed uppercase">
          {detail ?? `${project.upvoteCount} upvotes · ${project.category}`}
        </span>
      </span>
      <span
        className={`hidden rounded-full border px-2.5 py-1 text-[10px] font-semibold sm:block ${STATUS_CLASSES[project.status]}`}
      >
        {STATUS_LABELS[project.status]}
      </span>
    </Link>
  )
}
