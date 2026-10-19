// One project in the discovery grid: derived cover art, stack, author, and engagement actions.
// The first card on a page can take the lead treatment, spanning two columns with the cover
// beside the text, so the grid does not read as one repeated tile.

import { Link } from 'react-router'
import { cn } from '@/lib/cn'
import { BookmarkButton } from './BookmarkButton'
import { ContributorStack } from './ContributorStack'
import { PersonTrigger } from './PersonTrigger'
import { ProjectCover } from './ProjectCover'
import { UpvoteButton } from './UpvoteButton'
import type { Project } from '@/types'

interface ProjectCardProps {
  project: Project
  /** Lead cards span two columns and lay the cover out beside the text. */
  lead?: boolean
  saved?: boolean
  onUpvote: (projectId: string) => void
  onToggleBookmark?: (projectId: string) => void
  /** Opens the project. Without it the title links straight to the detail page. */
  onOpen?: (slug: string) => void
}

const MAX_TAGS = 3

export function ProjectCard({
  project,
  lead = false,
  saved = false,
  onUpvote,
  onToggleBookmark,
  onOpen,
}: ProjectCardProps) {
  const title = (
    <span className="font-display text-lg font-semibold tracking-tight">{project.title}</span>
  )

  return (
    <article
      className={cn(
        'border-line bg-surface shadow-card group hover:border-ink-muted/60 hover:shadow-card-hover relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 motion-reduce:transition-none',
        lead && 'sm:col-span-2 sm:flex-row',
      )}
    >
      <div
        onClick={onOpen ? () => onOpen(project.slug) : undefined}
        className={cn(
          'relative overflow-hidden',
          onOpen && 'cursor-pointer',
          lead ? 'aspect-video sm:aspect-auto sm:w-1/2' : 'aspect-video',
        )}
      >
        <ProjectCover project={project} emphasis={lead} />
        <span className="border-line bg-surface/85 absolute top-3 left-3 rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
          {project.category}
        </span>
        {project.openToContributions && (
          <span className="border-line bg-surface/85 absolute top-3 right-3 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
            <span className="bg-accent h-1.5 w-1.5 rounded-full" />
            Open to contributors
          </span>
        )}
        {onOpen && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-3 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none max-md:pointer-events-auto max-md:translate-y-0 max-md:opacity-100">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onOpen(project.slug)
              }}
              className="border-line bg-surface/90 hover:bg-surface w-full rounded-lg border px-3 py-2 text-sm font-semibold backdrop-blur"
            >
              Explore project
            </button>
          </div>
        )}
      </div>

      <div className={cn('flex flex-1 flex-col p-5', lead && 'sm:justify-center sm:p-6')}>
        <h3>
          {onOpen ? (
            <button
              type="button"
              onClick={() => onOpen(project.slug)}
              className="hover:text-brand-700 text-left transition-colors"
            >
              {title}
            </button>
          ) : (
            <Link
              to={`/projects/${project.slug}`}
              className="hover:text-brand-700 transition-colors"
            >
              {title}
            </Link>
          )}
        </h3>

        <p className="text-ink-muted mt-1.5 line-clamp-2 text-sm leading-relaxed">
          {project.summary}
        </p>

        <ul aria-label="Technology stack" className="mt-3 flex flex-wrap gap-1.5">
          {project.tags.slice(0, MAX_TAGS).map((tag) => (
            <li
              key={tag}
              className="bg-surface-raised text-ink-soft rounded-md px-2 py-0.5 text-[11px] font-medium"
            >
              {tag}
            </li>
          ))}
          {project.tags.length > MAX_TAGS && (
            <li className="text-ink-muted px-1 py-0.5 text-[11px] font-medium">
              +{project.tags.length - MAX_TAGS} more
            </li>
          )}
        </ul>

        {project.contributors.length > 0 && (
          <div className="mt-3.5 flex items-center gap-2">
            <ContributorStack contributors={project.contributors} />
            <span className="text-ink-muted truncate text-xs">
              {project.contributors.length === 1
                ? '1 contributor'
                : `${project.contributors.length} contributors`}
            </span>
          </div>
        )}

        <footer className="border-line mt-auto flex items-center justify-between gap-3 border-t pt-3.5">
          <PersonTrigger
            name={project.authorName}
            avatarUrl={project.authorAvatarUrl}
            profileId={project.authorId}
            headline={project.authorHeadline}
            size="sm"
            className="max-w-[55%]"
          />
          <div className="flex shrink-0 items-center gap-1.5">
            <span
              className="text-ink-muted hidden items-center gap-1 text-xs tabular-nums sm:flex"
              title={`${project.commentCount} comments`}
            >
              <svg viewBox="0 0 20 20" aria-hidden className="h-3.5 w-3.5 fill-current">
                <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h11A1.5 1.5 0 0 1 17 4.5v8a1.5 1.5 0 0 1-1.5 1.5H8l-4 3v-3a1 1 0 0 1-1-1v-8Z" />
              </svg>
              {project.commentCount}
            </span>
            <UpvoteButton
              count={project.upvoteCount}
              hasUpvoted={project.viewerHasUpvoted}
              onToggle={() => onUpvote(project.id)}
            />
            {onToggleBookmark && (
              <BookmarkButton saved={saved} onToggle={() => onToggleBookmark(project.id)} />
            )}
          </div>
        </footer>
      </div>
    </article>
  )
}
