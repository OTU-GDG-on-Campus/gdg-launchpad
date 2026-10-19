// Mirrors the discovery filters in the URL, so any view of the feed can be shared and survives a
// reload. Filter changes reset to page one.

import { useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { CATEGORY_FILTERS } from '@/config/site'
import type { ProjectCategory, ProjectSort } from '@/types'

const SORTS: ProjectSort[] = ['trending', 'top', 'new']
const CATEGORIES = new Set<string>(CATEGORY_FILTERS)

export interface ProjectsUrlState {
  search: string
  sort: ProjectSort
  category: ProjectCategory | 'All'
  technologies: string[]
  openToContributions: boolean
  page: number
  /** True when a search, category, technology, or contribution filter is narrowing the feed. */
  hasActiveFilters: boolean
  setSearch: (value: string) => void
  setSort: (value: ProjectSort) => void
  setCategory: (value: ProjectCategory | 'All') => void
  setTechnologies: (value: string[]) => void
  setOpenToContributions: (value: boolean) => void
  setPage: (value: number) => void
  clearFilters: () => void
}

export function useProjectsUrlState(): ProjectsUrlState {
  const [params, setParams] = useSearchParams()

  const search = params.get('q') ?? ''
  const sortParam = params.get('tab')
  const sort: ProjectSort = SORTS.includes(sortParam as ProjectSort)
    ? (sortParam as ProjectSort)
    : 'trending'
  const categoryParam = params.get('cat') ?? 'All'
  const category = (CATEGORIES.has(categoryParam) ? categoryParam : 'All') as
    ProjectCategory | 'All'
  const technologies = (params.get('tech') ?? '')
    .split(',')
    .map((technology) => technology.trim())
    .filter(Boolean)
  const openToContributions = params.get('contrib') === '1'
  const page = Math.max(1, Number(params.get('page')) || 1)

  const update = useCallback(
    (changes: Record<string, string | null>, resetPage = true) => {
      const next = new URLSearchParams(params)
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value)
        else next.delete(key)
      }
      if (resetPage) next.delete('page')
      setParams(next)
    },
    [params, setParams],
  )

  const setPage = useCallback(
    (value: number) => update({ page: value > 1 ? String(value) : null }, false),
    [update],
  )

  const clearFilters = useCallback(() => {
    const next = new URLSearchParams()
    const tab = params.get('tab')
    if (tab) next.set('tab', tab)
    setParams(next)
  }, [params, setParams])

  return {
    search,
    sort,
    category,
    technologies,
    openToContributions,
    page,
    hasActiveFilters:
      search !== '' || category !== 'All' || technologies.length > 0 || openToContributions,
    setSearch: (value) => update({ q: value }),
    setSort: (value) => update({ tab: value === 'trending' ? null : value }),
    setCategory: (value) => update({ cat: value === 'All' ? null : value }),
    setTechnologies: (value) => update({ tech: value.length > 0 ? value.join(',') : null }),
    setOpenToContributions: (value) => update({ contrib: value ? '1' : null }),
    setPage,
    clearFilters,
  }
}
