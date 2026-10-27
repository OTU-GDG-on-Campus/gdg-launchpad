// Viewer-scoped project feed with upvote overrides that cannot leak across accounts.

import { useLayoutEffect, useRef, useState } from 'react'
import { useAuth } from '@/lib/auth/useAuth'
import { listProjects, toggleUpvote } from '@/lib/api/client'
import { useAsync } from '@/lib/useAsync'
import type { Project, ProjectQuery } from '@/types'

export function useProjectFeed(query: ProjectQuery) {
  const { sort = 'top', sprintId, category = 'All', search = '', page = 1, perPage } = query
  const { user } = useAuth()
  const viewerKey = user?.id ?? 'signed-out'
  const activeViewer = useRef(viewerKey)
  useLayoutEffect(() => {
    activeViewer.current = viewerKey
  }, [viewerKey])
  const [overrideViewer, setOverrideViewer] = useState(viewerKey)
  const [overrides, setOverrides] = useState<Record<string, Project>>({})

  if (overrideViewer !== viewerKey) {
    setOverrideViewer(viewerKey)
    setOverrides({})
  }

  const { data, loading, error } = useAsync(
    () => listProjects({ sort, sprintId, category, search, page, perPage }),
    [viewerKey, sort, sprintId ?? 'none', category, search, page, perPage ?? 'default'].join('|'),
  )

  const projects = (data?.projects ?? []).map((project) => overrides[project.id] ?? project)

  async function upvote(projectId: string) {
    const updated = await toggleUpvote(projectId)
    if (activeViewer.current === viewerKey)
      setOverrides((current) => ({ ...current, [projectId]: updated }))
  }

  return {
    projects,
    totalCount: data?.totalCount ?? 0,
    pageCount: data?.pageCount ?? 1,
    loading,
    error,
    upvote,
  }
}
