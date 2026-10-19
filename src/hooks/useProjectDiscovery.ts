// Loads one page of the discovery feed and layers optimistic upvote and bookmark overrides on
// top, so what is on screen updates immediately while the data layer confirms.

import { useCallback, useMemo, useState } from 'react'
import { listBookmarkedIds, listProjects, toggleBookmark, toggleUpvote } from '@/lib/api/client'
import { useAsync } from '@/lib/useAsync'
import type { Project, ProjectQuery } from '@/types'

export function useProjectDiscovery(query: ProjectQuery, viewerKey: string) {
  const {
    sort = 'trending',
    category = 'All',
    search = '',
    technologies = [],
    openToContributions = false,
    page = 1,
    perPage,
  } = query

  const key = [
    sort,
    category,
    search,
    technologies.join(','),
    String(openToContributions),
    page,
    perPage ?? 'default',
  ].join('|')

  const { data, loading, error } = useAsync(
    () =>
      listProjects({ sort, category, search, technologies, openToContributions, page, perPage }),
    key,
  )
  const bookmarks = useAsync(() => listBookmarkedIds(), viewerKey)

  const [upvoteOverrides, setUpvoteOverrides] = useState<Record<string, Project>>({})
  const [savedOverrides, setSavedOverrides] = useState<Record<string, boolean>>({})

  const savedIds = useMemo(() => {
    const ids = new Set(bookmarks.data ?? [])
    for (const [id, saved] of Object.entries(savedOverrides)) {
      if (saved) ids.add(id)
      else ids.delete(id)
    }
    return ids
  }, [bookmarks.data, savedOverrides])

  const projects = useMemo(
    () => (data?.projects ?? []).map((project) => upvoteOverrides[project.id] ?? project),
    [data, upvoteOverrides],
  )

  const upvote = useCallback(async (projectId: string) => {
    const updated = await toggleUpvote(projectId)
    setUpvoteOverrides((current) => ({ ...current, [projectId]: updated }))
  }, [])

  const toggleSaved = useCallback(
    async (projectId: string) => {
      const previous = savedIds.has(projectId)
      setSavedOverrides((current) => ({ ...current, [projectId]: !previous }))
      try {
        const saved = await toggleBookmark(projectId)
        setSavedOverrides((current) => ({ ...current, [projectId]: saved }))
      } catch (cause) {
        setSavedOverrides((current) => ({ ...current, [projectId]: previous }))
        throw cause
      }
    },
    [savedIds],
  )

  return {
    projects,
    totalCount: data?.totalCount ?? 0,
    pageCount: data?.pageCount ?? 1,
    loading,
    error,
    savedIds,
    upvote,
    toggleSaved,
  }
}
