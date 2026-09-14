// The single seam between UI and data. Every component reads through these functions, so
// swapping mock arrays for Supabase queries touches this file and nothing else.

import { MOCK_COMMENTS } from './mock/comments'
import { MOCK_PROJECTS } from './mock/projects'
import { MOCK_SPRINTS } from './mock/sprints'
import type { Comment, Project, ProjectPage, ProjectQuery, Sprint } from '@/types'

export const DEFAULT_PER_PAGE = 9

function sortProjects(projects: Project[], sort: ProjectQuery['sort']): Project[] {
  const compare =
    sort === 'new'
      ? (a: Project, b: Project) => b.createdAt.localeCompare(a.createdAt)
      : (a: Project, b: Project) => b.upvoteCount - a.upvoteCount
  return [...projects].sort(compare)
}

function matchesSearch(project: Project, search: string): boolean {
  const haystack = [project.title, project.summary, ...project.tags].join(' ').toLowerCase()
  return haystack.includes(search.trim().toLowerCase())
}

export async function listProjects({
  sort = 'top',
  sprintId,
  category = 'All',
  search = '',
  page = 1,
  perPage = DEFAULT_PER_PAGE,
}: ProjectQuery = {}): Promise<ProjectPage> {
  let matched = MOCK_PROJECTS.filter((project) => project.status === 'approved')
  if (sprintId) matched = matched.filter((project) => project.sprintId === sprintId)
  if (category !== 'All') matched = matched.filter((project) => project.category === category)
  if (search) matched = matched.filter((project) => matchesSearch(project, search))

  const sorted = sortProjects(matched, sort)
  const pageCount = Math.max(1, Math.ceil(sorted.length / perPage))
  const safePage = Math.min(Math.max(page, 1), pageCount)
  const start = (safePage - 1) * perPage

  return {
    projects: sorted.slice(start, start + perPage),
    totalCount: sorted.length,
    pageCount,
    page: safePage,
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return MOCK_PROJECTS.find((project) => project.slug === slug) ?? null
}

/** Toggles the viewer's upvote and returns the updated project. Server enforces one per user. */
export async function toggleUpvote(projectId: string): Promise<Project> {
  const project = MOCK_PROJECTS.find((candidate) => candidate.id === projectId)
  if (!project) throw new Error(`Unknown project: ${projectId}`)

  const nextHasUpvoted = !project.viewerHasUpvoted
  return {
    ...project,
    viewerHasUpvoted: nextHasUpvoted,
    upvoteCount: project.upvoteCount + (nextHasUpvoted ? 1 : -1),
  }
}

export async function listComments(projectId: string): Promise<Comment[]> {
  return MOCK_COMMENTS.filter((comment) => comment.projectId === projectId).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )
}

export async function listSprints(): Promise<Sprint[]> {
  const order: Record<Sprint['status'], number> = { active: 0, upcoming: 1, completed: 2 }
  return [...MOCK_SPRINTS].sort(
    (a, b) => order[a.status] - order[b.status] || a.startDate.localeCompare(b.startDate),
  )
}

export async function getSprintBySlug(slug: string): Promise<Sprint | null> {
  return MOCK_SPRINTS.find((sprint) => sprint.slug === slug) ?? null
}
