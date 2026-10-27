// The admin-picked highlight above the feed: an editorial spread on desktop and a stacked
// layout on mobile. Only a reference to the project is stored, never a copy of its data.

import { Button } from '@/components/ui/Button'
import { formatDateRange } from '@/lib/format'
import { BookmarkButton } from './BookmarkButton'
import { PersonTrigger } from './PersonTrigger'
import { ProjectCover } from './ProjectCover'
import { UpvoteButton } from './UpvoteButton'
import type { FeaturedSelection } from '@/types'

interface FeaturedProjectProps {
  selection: FeaturedSelection
  saved: boolean
  onUpvote: (projectId: string) => void
  onToggleBookmark: (projectId: string) => void
  onOpen: (slug: string) => void
}

const MAX_TAGS = 5

export function FeaturedProject({
  selection,
  saved,
  onUpvote,
  onToggleBookmark,
  onOpen,
}: FeaturedProjectProps) {
  const { project } = selection

  return (
    <section
      aria-labelledby="featured-heading"
      className="border-line bg-surface shadow-card mt-12 overflow-hidden rounded-2xl border sm:grid sm:grid-cols-12 sm:items-stretch"
    >
      <div className="relative aspect-video sm:col-span-7 sm:aspect-auto sm:min-h-[22rem]">
        <ProjectCover project={project} emphasis />
        <span className="border-line bg-surface/85 absolute top-4 left-4 rounded-full border px-3 py-1.5 text-[11px] font-semibold backdrop-blur">
          Featured project of the week
        </span>
      </div>

      <div className="flex flex-col justify-center gap-4 p-6 sm:col-span-5 sm:p-8">
        <p className="border-accent text-ink-muted border-l-2 pl-3 text-xs font-medium">
          {formatDateRange(selection.startsAt, selection.endsAt)}
        </p>

        <div>
          <h2
            id="featured-heading"
            className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
          >
            {project.title}
          </h2>
          <p className="text-ink-soft mt-2 line-clamp-3 text-sm leading-relaxed">
            {project.description}
          </p>
        </div>

        <ul aria-label="Technology stack" className="flex flex-wrap gap-1.5">
          {project.tags.slice(0, MAX_TAGS).map((tag) => (
            <li
              key={tag}
              className="bg-surface-raised text-ink-soft rounded-md px-2 py-0.5 text-[11px] font-medium"
            >
              {tag}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <PersonTrigger
            name={project.authorName}
            avatarUrl={project.authorAvatarUrl}
            profileId={project.authorId}
            headline={project.authorHeadline}
          />
          <div className="flex items-center gap-2">
            <UpvoteButton
              count={project.upvoteCount}
              hasUpvoted={project.viewerHasUpvoted}
              onToggle={() => onUpvote(project.id)}
            />
            <BookmarkButton saved={saved} onToggle={() => onToggleBookmark(project.id)} />
          </div>
        </div>

        <div className="mt-1">
          <Button onClick={() => onOpen(project.slug)}>Explore project</Button>
        </div>
      </div>
    </section>
  )
}
