// Viewer-scoped discovery data with optimistic saves and upvote overrides that reset on sign-out.

import { useCallback, useMemo, useLayoutEffect, useRef, useState } from 'react'
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

  const activeViewer = useRef(viewerKey)
  useLayoutEffect(() => {
    activeViewer.current = viewerKey
  }, [viewerKey])
  const key = [
    viewerKey,
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

  const [overrideViewer, setOverrideViewer] = useState(viewerKey)
  if (overrideViewer !== viewerKey) {
    setOverrideViewer(viewerKey)
    setUpvoteOverrides({})
    setSavedOverrides({})
  }

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

  const upvote = useCallback(
    async (projectId: string) => {
      const updated = await toggleUpvote(projectId)
      if (activeViewer.current === viewerKey)
        setUpvoteOverrides((current) => ({ ...current, [projectId]: updated }))
    },
    [viewerKey],
  )

  const toggleSaved = useCallback(
    async (projectId: string) => {
      const previous = savedIds.has(projectId)
      setSavedOverrides((current) => ({ ...current, [projectId]: !previous }))
      try {
        const saved = await toggleBookmark(projectId)
        if (activeViewer.current === viewerKey)
          setSavedOverrides((current) => ({ ...current, [projectId]: saved }))
      } catch (cause) {
        if (activeViewer.current === viewerKey)
          setSavedOverrides((current) => ({ ...current, [projectId]: previous }))
        throw cause
      }
    },
    [savedIds, viewerKey],
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
