// Project gallery: category filters, search, sort, and a paginated grid.

import { useState } from 'react'
import { Link } from 'react-router'
import { ProjectList } from '@/components/projects/ProjectList'
import { Button } from '@/components/ui/Button'
import { FilterPills } from '@/components/ui/FilterPills'
import { Pagination } from '@/components/ui/Pagination'
import { PageHeader } from '@/components/ui/PageHeader'
import { ErrorState, LoadingState } from '@/components/ui/PageState'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { CATEGORY_FILTERS } from '@/config/site'
import { useProjectFeed } from '@/hooks/useProjectFeed'
import { formatCount } from '@/lib/format'
import type { ProjectSort } from '@/types'

type CategoryFilter = (typeof CATEGORY_FILTERS)[number]

const SORT_OPTIONS: { value: ProjectSort; label: string }[] = [
  { value: 'top', label: 'Most upvoted' },
  { value: 'new', label: 'Newest' },
]

export function ProjectsPage() {
  const [category, setCategory] = useState<CategoryFilter>('All')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<ProjectSort>('top')
  const [page, setPage] = useState(1)

  const { projects, totalCount, pageCount, loading, error, upvote } = useProjectFeed({
    category,
    search,
    sort,
    page,
  })

  // Narrowing the results can strand the viewer on a page that no longer exists.
  function changeCategory(next: CategoryFilter) {
    setCategory(next)
    setPage(1)
  }

  function changeSearch(next: string) {
    setSearch(next)
    setPage(1)
  }

  function changeSort(next: ProjectSort) {
    setSort(next)
    setPage(1)
  }

  return (
    <>
      <PageHeader
        title="Projects"
        description="Explore what Ontario Tech students are building."
        actions={
          <Link to="/submit">
            <Button>Post a project</Button>
          </Link>
        }
      />

      <div className="space-y-4">
        <FilterPills
          label="Filter by category"
          options={CATEGORY_FILTERS}
          value={category}
          onChange={changeCategory}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <SearchInput
            label="Search projects"
            placeholder="Search projects..."
            value={search}
            onChange={changeSearch}
          />
          <Select label="Sort by:" options={SORT_OPTIONS} value={sort} onChange={changeSort} />
        </div>
      </div>

      <div className="mt-8">
        {error ? (
          <ErrorState error={error} />
        ) : loading ? (
          <LoadingState label="Loading projects" />
        ) : (
          <>
            <p className="text-ink-muted mb-4 text-sm">{formatCount(totalCount, 'project')}</p>
            <ProjectList
              projects={projects}
              onUpvote={(id) => void upvote(id)}
              emptyTitle="No projects match those filters"
              emptyHint="Try a different category, or clear the search."
            />
            <div className="mt-10">
              <Pagination page={page} pageCount={pageCount} onChange={setPage} />
            </div>
          </>
        )}
      </div>
    </>
  )
}
