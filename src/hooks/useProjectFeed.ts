// Loads a page of projects and applies upvote toggles optimistically.
// Toggled projects are held in an override map so the loaded page stays untouched.

import { useState } from 'react'
import { listProjects, toggleUpvote } from '@/lib/api/client'
import { useAsync } from '@/lib/useAsync'
import type { Project, ProjectQuery } from '@/types'

export function useProjectFeed(query: ProjectQuery) {
  const { sort = 'top', sprintId, category = 'All', search = '', page = 1, perPage } = query
  const [overrides, setOverrides] = useState<Record<string, Project>>({})

  const { data, loading, error } = useAsync(
    () => listProjects({ sort, sprintId, category, search, page, perPage }),
    [sort, sprintId ?? 'none', category, search, page, perPage ?? 'default'].join('|'),
  )

  const projects = (data?.projects ?? []).map((project) => overrides[project.id] ?? project)

  async function upvote(projectId: string) {
    const updated = await toggleUpvote(projectId)
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
