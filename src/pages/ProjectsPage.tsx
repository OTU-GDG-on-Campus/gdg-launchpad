// The projects discovery page: a hero with live counts, the featured project of the week,
// discovery tabs, technology and advanced filters, a grid or list feed, and the in-page detail
// modal. Every filter lives in the URL, so any view here is shareable and survives a reload.

import { useState } from 'react'
import { Link } from 'react-router'
import { AdvancedFilters } from '@/components/projects/AdvancedFilters'
import { DiscoveryTabs } from '@/components/projects/DiscoveryTabs'
import { FeaturedProject } from '@/components/projects/FeaturedProject'
import { ProjectDetailModal } from '@/components/projects/ProjectDetailModal'
import { ProjectList } from '@/components/projects/ProjectList'
import { ProjectsHero } from '@/components/projects/ProjectsHero'
import { TechFilterChips } from '@/components/projects/TechFilterChips'
import { ViewToggle } from '@/components/projects/ViewToggle'
import { Button } from '@/components/ui/Button'
import { CardSkeleton } from '@/components/ui/CardSkeleton'
import { ErrorState } from '@/components/ui/PageState'
import { Pagination } from '@/components/ui/Pagination'
import { Toast } from '@/components/ui/Toast'
import { useProjectDiscovery } from '@/hooks/useProjectDiscovery'
import { useProjectsUrlState } from '@/hooks/useProjectsUrlState'
import { useProjectsView } from '@/hooks/useProjectsView'
import { getFeaturedProject, getProjectStats, listTechnologies } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/useAuth'
import { formatCount } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'

const SKELETON_COUNT = 6

export function ProjectsPage() {
  const filters = useProjectsUrlState()
  const { user } = useAuth()
  const [view, setView] = useProjectsView()
  const [bookmarkError, setBookmarkError] = useState<string | null>(null)

  const feed = useProjectDiscovery(
    {
      sort: filters.sort,
      category: filters.category,
      search: filters.search,
      technologies: filters.technologies,
      openToContributions: filters.openToContributions,
      page: filters.page,
    },
    user?.id ?? 'signed-out',
  )

  const stats = useAsync(() => getProjectStats(), 'project-stats')
  const technologies = useAsync(() => listTechnologies(), 'technology-facets')
  const featured = useAsync(() => getFeaturedProject(), 'featured-project')

  function toggleBookmark(projectId: string) {
    feed.toggleSaved(projectId).catch(() => {
      setBookmarkError('Could not save this project. Check your connection and try again.')
    })
  }

  const openListed = filters.openSlug
    ? feed.projects.find((project) => project.slug === filters.openSlug)
    : undefined

  return (
    <>
      <ProjectsHero
        stats={stats.data}
        onOpenSearch={() => window.dispatchEvent(new Event('launchpad:open-search'))}
      />

      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        {!filters.hasActiveFilters && featured.data && (
          <FeaturedProject
            selection={featured.data}
            saved={feed.savedIds.has(featured.data.project.id)}
            onUpvote={(id) => void feed.upvote(id)}
            onToggleBookmark={toggleBookmark}
            onOpen={filters.openProject}
          />
        )}

        <div className="mt-12 space-y-6">
          <DiscoveryTabs value={filters.sort} onChange={filters.setSort} />

          {technologies.data && technologies.data.length > 0 && (
            <TechFilterChips
              technologies={technologies.data}
              selected={filters.technologies}
              onChange={filters.setTechnologies}
            />
          )}

          <AdvancedFilters
            category={filters.category}
            onCategoryChange={filters.setCategory}
            openToContributions={filters.openToContributions}
            onOpenToContributionsChange={filters.setOpenToContributions}
            onClearAll={filters.clearFilters}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-ink-muted text-sm">
              {feed.loading
                ? 'Loading projects...'
                : `${formatCount(feed.totalCount, 'project')}${
                    filters.search ? ` matching "${filters.search}"` : ' in the feed'
                  }`}
              {!feed.loading && filters.hasActiveFilters && (
                <button
                  type="button"
                  onClick={filters.clearFilters}
                  className="text-brand-700 hover:text-brand-600 ml-2 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </p>
            <ViewToggle view={view} onChange={setView} />
          </div>

          {feed.error ? (
            <ErrorState error={feed.error} />
          ) : feed.loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
              {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <ProjectList
              projects={feed.projects}
              view={view}
              savedIds={feed.savedIds}
              onUpvote={(id) => void feed.upvote(id)}
              onToggleBookmark={toggleBookmark}
              onOpen={filters.openProject}
              emptyTitle="No projects match these filters"
              emptyHint="Try a different search or technology, or clear the filters."
            />
          )}

          <Pagination page={filters.page} pageCount={feed.pageCount} onChange={filters.setPage} />

          <div className="border-line bg-surface mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-6">
            <div>
              <h2 className="font-display text-lg font-semibold">Built something worth sharing?</h2>
              <p className="text-ink-muted mt-1 text-sm">
                Post it to LaunchPad and let the campus find your team.
              </p>
            </div>
            <Link to="/submit">
              <Button>Post a project</Button>
            </Link>
          </div>
        </div>

        {filters.openSlug && (
          <ProjectDetailModal
            slug={filters.openSlug}
            savedIds={feed.savedIds}
            override={openListed ? feed.overrideFor(openListed.id) : undefined}
            onUpvote={(id) => void feed.upvote(id)}
            onToggleBookmark={toggleBookmark}
            onClose={filters.closeProject}
          />
        )}

        {bookmarkError && (
          <Toast message={bookmarkError} onDismiss={() => setBookmarkError(null)} />
        )}
      </div>
    </>
  )
}
