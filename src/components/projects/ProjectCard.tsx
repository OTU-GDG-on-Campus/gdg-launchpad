// One project in the gallery: cover, tags, title, summary, and engagement counts.

import { Link } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import { coverTint } from '@/lib/coverTint'
import { ContributorStack } from './ContributorStack'
import { UpvoteButton } from './UpvoteButton'
import type { Project } from '@/types'

interface ProjectCardProps {
  project: Project
  onUpvote: (projectId: string) => void
}

export function ProjectCard({ project, onUpvote }: ProjectCardProps) {
  return (
    <article className="border-line bg-surface hover:border-ink-muted flex flex-col overflow-hidden rounded-xl border transition-colors">
      <div className="relative">
        {project.coverImageUrl ? (
          <img src={project.coverImageUrl} alt="" className="aspect-video w-full object-cover" />
        ) : (
          <div className={cn('aspect-video w-full bg-gradient-to-br', coverTint(project.slug))} />
        )}
        {project.openToContributions && (
          <span className="bg-brand-500 absolute top-3 left-3 rounded-md px-2 py-1 text-[10px] font-bold tracking-wide text-white uppercase">
            Open for contributions
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <Badge key={tag} tone="success">
              {tag}
            </Badge>
          ))}
        </div>

        <h3 className="font-semibold">
          <Link to={`/projects/${project.slug}`} className="hover:text-brand-700">
            {project.title}
          </Link>
        </h3>
        <p className="text-ink-muted mt-1 line-clamp-2 flex-1 text-sm">{project.summary}</p>

        <footer className="border-line mt-4 flex items-center gap-4 border-t pt-3">
          <UpvoteButton
            count={project.upvoteCount}
            hasUpvoted={project.viewerHasUpvoted}
            onToggle={() => onUpvote(project.id)}
          />
          <span className="text-ink-muted flex items-center gap-1.5 text-sm">
            <svg viewBox="0 0 20 20" aria-hidden className="h-4 w-4 fill-current">
              <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h11A1.5 1.5 0 0 1 17 4.5v8a1.5 1.5 0 0 1-1.5 1.5H8l-4 3v-3a1 1 0 0 1-1-1v-8Z" />
            </svg>
            <span className="tabular-nums">{project.commentCount}</span>
          </span>
          <div className="ml-auto">
            <ContributorStack contributors={project.contributors} />
          </div>
        </footer>
      </div>
    </article>
  )
}
