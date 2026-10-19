// Compact horizontal row for the list view: the same project data and actions as the grid card,
// arranged for scanning rather than browsing.

import { Link } from 'react-router'
import { cn } from '@/lib/cn'
import { BookmarkButton } from './BookmarkButton'
import { PersonTrigger } from './PersonTrigger'
import { ProjectCover } from './ProjectCover'
import { UpvoteButton } from './UpvoteButton'
import type { Project } from '@/types'

interface ProjectRowCardProps {
  project: Project
  saved?: boolean
  onUpvote: (projectId: string) => void
  onToggleBookmark?: (projectId: string) => void
  /** Opens the project. Without it the title links straight to the detail page. */
  onOpen?: (slug: string) => void
}

export function ProjectRowCard({
  project,
  saved = false,
  onUpvote,
  onToggleBookmark,
  onOpen,
}: ProjectRowCardProps) {
  return (
    <article className="border-line bg-surface hover:border-ink-muted/60 shadow-card flex items-stretch gap-4 rounded-xl border p-3 transition-colors sm:gap-5 sm:p-4">
      <div
        onClick={onOpen ? () => onOpen(project.slug) : undefined}
        className={cn(
          'relative h-24 w-32 shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-44',
          onOpen && 'cursor-pointer',
        )}
      >
        <ProjectCover project={project} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3>
            {onOpen ? (
              <button
                type="button"
                onClick={() => onOpen(project.slug)}
                className="hover:text-brand-700 font-display text-base font-semibold tracking-tight transition-colors"
              >
                {project.title}
              </button>
            ) : (
              <Link
                to={`/projects/${project.slug}`}
                className="hover:text-brand-700 font-display text-base font-semibold tracking-tight transition-colors"
              >
                {project.title}
              </Link>
            )}
          </h3>
          {project.openToContributions && (
            <span className="text-accent-ink flex items-center gap-1 text-[11px] font-medium">
              <span className="bg-accent h-1.5 w-1.5 rounded-full" />
              Open to contributors
            </span>
          )}
        </div>

        <p className="text-ink-muted mt-1 line-clamp-2 text-sm leading-relaxed">
          {project.summary}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <ul aria-label="Technology stack" className="flex flex-wrap gap-1.5">
            {project.tags.slice(0, 3).map((tag) => (
              <li
                key={tag}
                className="bg-surface-raised text-ink-soft rounded-md px-2 py-0.5 text-[11px] font-medium"
              >
                {tag}
              </li>
            ))}
          </ul>
          <PersonTrigger
            name={project.authorName}
            avatarUrl={project.authorAvatarUrl}
            profileId={project.authorId}
            size="sm"
            className="max-w-full"
          />
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-center gap-1.5">
        <UpvoteButton
          count={project.upvoteCount}
          hasUpvoted={project.viewerHasUpvoted}
          onToggle={() => onUpvote(project.id)}
        />
        {onToggleBookmark && (
          <BookmarkButton saved={saved} onToggle={() => onToggleBookmark(project.id)} />
        )}
      </div>
    </article>
  )
}
