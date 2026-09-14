// Project detail sidebar: upvote, contribution status, author, team, and repo links.

import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth/useAuth'
import { Avatar } from '@/components/ui/Avatar'
import { formatDate } from '@/lib/format'
import type { Project } from '@/types'

interface ProjectSidebarProps {
  project: Project
  onUpvote: () => void
}

export function ProjectSidebar({ project, onUpvote }: ProjectSidebarProps) {
  const { canParticipate } = useAuth()

  return (
    <aside className="border-line bg-surface space-y-5 rounded-xl border p-5">
      <Button
        onClick={onUpvote}
        disabled={!canParticipate}
        variant="secondary"
        className="border-accent text-accent hover:bg-accent-soft w-full"
      >
        <svg viewBox="0 0 20 20" aria-hidden className="h-4 w-4 fill-current">
          <path d="M10 1a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4.6 4.4 5.2a.8.8 0 0 1-.6 1.3h-2v2.3a.8.8 0 0 1-.8.8H9a.8.8 0 0 1-.8-.8v-2.3h-2a.8.8 0 0 1-.6-1.3L10 5.6Z" />
        </svg>
        {project.viewerHasUpvoted ? 'Upvoted' : 'Upvote project'} ({project.upvoteCount})
      </Button>

      {project.openToContributions && (
        <div className="bg-brand-500 rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white">
          Open for contributions
        </div>
      )}

      <div className="flex items-center gap-3">
        <Avatar name={project.authorName} src={project.authorAvatarUrl} size="lg" />
        <div className="min-w-0">
          <p className="truncate font-semibold">{project.authorName}</p>
          <p className="text-ink-muted truncate text-xs">
            {project.authorHeadline ? `${project.authorHeadline} - ` : ''}
            Posted {formatDate(project.createdAt)}
          </p>
        </div>
      </div>

      {project.contributors.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold">Team members</h2>
          <ul className="space-y-3">
            {project.contributors.map((contributor) => (
              <li key={contributor.id} className="flex items-center gap-3">
                <Avatar name={contributor.name} src={contributor.avatarUrl} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{contributor.name}</p>
                  {contributor.role && (
                    <p className="text-ink-muted truncate text-xs">{contributor.role}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        {project.repoUrl && (
          <Button variant="secondary" href={project.repoUrl} className="w-full">
            View on GitHub
          </Button>
        )}
        {project.liveUrl && (
          <Button variant="secondary" href={project.liveUrl} className="w-full">
            Open live demo
          </Button>
        )}
      </div>

      <p className="text-center">
        <button type="button" className="text-ink-muted hover:text-ink text-xs underline">
          Report project
        </button>
      </p>
    </aside>
  )
}
