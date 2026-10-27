// A project's cover: the real image when one exists, otherwise a deterministic wash, faint grid,
// and title monogram derived from the project itself. No fake screenshots are ever invented.

import { cn } from '@/lib/cn'
import { coverTint, titleMonogram } from '@/lib/coverTint'
import type { Project } from '@/types'

interface ProjectCoverProps {
  project: Project
  className?: string
  /** Larger monogram for lead cards, the featured spread, and the detail modal. */
  emphasis?: boolean
}

export function ProjectCover({ project, className, emphasis = false }: ProjectCoverProps) {
  if (project.coverImageUrl) {
    return (
      <img
        src={project.coverImageUrl}
        alt=""
        loading="lazy"
        className={cn('h-full w-full object-cover', className)}
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        'bg-surface-raised relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br',
        coverTint(project.slug),
        className,
      )}
    >
      <div className="cover-grid absolute inset-0 opacity-70" />
      <span
        className={cn(
          'font-display text-ink/60 relative font-bold tracking-tight',
          emphasis ? 'text-6xl sm:text-7xl' : 'text-4xl sm:text-5xl',
        )}
      >
        {titleMonogram(project.title)}
      </span>
    </div>
  )
}
