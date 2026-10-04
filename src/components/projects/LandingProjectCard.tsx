// Landing-page project card: featured cover, standard tile, or compact row with existing upvotes.

import { Link } from 'react-router'
import { cn } from '@/lib/cn'
import type { Project } from '@/types'
import { ContributorStack } from './ContributorStack'
import { UpvoteButton } from './UpvoteButton'

type CardVariant = 'featured' | 'standard' | 'compact'

const CARD_CLASSES: Record<CardVariant, string> = {
  featured: 'md:col-span-2',
  standard: '',
  compact: 'flex flex-row items-center gap-4 p-3 sm:p-4',
}
const COVER_CLASSES: Record<CardVariant, string> = {
  featured: 'aspect-[16/8] sm:aspect-[16/7]',
  standard: 'aspect-[16/9]',
  compact: 'h-18 w-18 shrink-0 rounded-lg sm:h-20 sm:w-24',
}

interface LandingProjectCardProps {
  project: Project
  variant?: CardVariant
  onUpvote: (projectId: string) => void
}

export function LandingProjectCard({
  project,
  variant = 'standard',
  onUpvote,
}: LandingProjectCardProps) {
  const compact = variant === 'compact'
  const projectPath = `/projects/${project.slug}`

  return (
    <article
      className={cn(
        'border-line bg-surface hover:border-brand-700 overflow-hidden rounded-xl border transition-colors',
        CARD_CLASSES[variant],
      )}
    >
      <Link
        to={projectPath}
        aria-label={`View ${project.title}`}
        className={cn('bg-surface-raised relative block overflow-hidden', COVER_CLASSES[variant])}
      >
        {project.coverImageUrl ? (
          <img
            src={project.coverImageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="landing-cover flex h-full w-full items-center justify-center p-4 sm:p-8"
          >
            <div className="border-brand-700/30 bg-surface/90 flex h-3/4 w-4/5 flex-col overflow-hidden rounded-lg border shadow-lg">
              <div className="border-line flex items-center gap-1.5 border-b px-3 py-2">
                <span className="bg-flare h-1.5 w-1.5 rounded-full" />
                <span className="bg-accent h-1.5 w-1.5 rounded-full" />
                <span className="bg-brand-700 h-1.5 w-1.5 rounded-full" />
              </div>
              <div className="flex flex-1 items-center justify-center px-3 py-2 text-center">
                <span
                  className={cn(
                    'text-brand-700 font-mono font-bold',
                    compact ? 'text-sm' : 'text-2xl sm:text-3xl',
                  )}
                >
                  {compact ? '</>' : project.category}
                </span>
              </div>
              {!compact && (
                <div className="border-line text-ink-muted border-t px-3 py-2 font-mono text-[10px]">
                  {project.title}
                </div>
              )}
            </div>
          </div>
        )}
        {!compact && project.openToContributions && (
          <span className="border-line bg-surface text-ink absolute top-4 left-4 rounded-md border px-3 py-1.5 font-mono text-[10px] font-semibold tracking-wide uppercase">
            Open to contributions
          </span>
        )}
      </Link>

      <div className={cn('min-w-0', compact ? 'flex-1' : 'p-5 sm:p-6')}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3
            className={cn(
              'font-bold tracking-tight',
              compact ? 'text-base' : 'text-xl sm:text-2xl',
            )}
          >
            <Link to={projectPath} className="hover:text-brand-700">
              {project.title}
            </Link>
          </h3>
          {!compact && (
            <span className="text-ink-muted font-mono text-[10px] tracking-wide uppercase">
              {project.category}
            </span>
          )}
        </div>
        {!compact && (
          <p className="text-ink-muted mt-2 line-clamp-2 text-sm leading-relaxed">
            {project.summary}
          </p>
        )}
        <ul aria-label="Project technologies" className="mt-3 flex flex-wrap gap-1.5">
          {project.tags.slice(0, compact ? 2 : 5).map((tag) => (
            <li
              key={tag}
              className="border-line bg-surface-raised text-ink-soft rounded border px-2 py-1 font-mono text-[10px]"
            >
              {tag}
            </li>
          ))}
        </ul>
        {compact && (
          <p className="text-ink-muted mt-2 text-xs">
            {project.category}
            {project.openToContributions ? ' · Open to contributions' : ''}
          </p>
        )}
        {!compact && (
          <div className="border-line mt-5 flex flex-wrap items-center justify-between gap-4 border-t pt-4">
            <div className="flex flex-wrap items-center gap-4">
              <UpvoteButton
                count={project.upvoteCount}
                hasUpvoted={project.viewerHasUpvoted}
                onToggle={() => onUpvote(project.id)}
              />
              <Link
                to={projectPath}
                aria-label={`${project.commentCount} comments on ${project.title}`}
                className="text-ink-muted hover:text-brand-700 text-xs"
              >
                {project.commentCount} comments
              </Link>
              <ContributorStack contributors={project.contributors} />
            </div>
            <Link to={projectPath} className="text-brand-700 text-sm font-semibold">
              Open project <span aria-hidden="true">↗</span>
            </Link>
          </div>
        )}
      </div>
      {compact && (
        <div className="shrink-0">
          <UpvoteButton
            count={project.upvoteCount}
            hasUpvoted={project.viewerHasUpvoted}
            onToggle={() => onUpvote(project.id)}
          />
        </div>
      )}
    </article>
  )
}
