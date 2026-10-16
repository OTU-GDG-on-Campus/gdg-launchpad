// The single seam between UI and data. Auth goes through Supabase when configured, the rest still
// reads mock arrays, so swapping those for Supabase queries touches this file and nothing else.

import { ALLOWED_EMAIL_DOMAINS } from '@/config/site'
import type { Comment, Project, ProjectPage, ProjectQuery, Sprint, User } from '@/types'
import { MOCK_COMMENTS } from './mock/comments'
import { MOCK_PROJECTS } from './mock/projects'
import { MOCK_SPRINTS } from './mock/sprints'
import { DEMO_USER } from './mock/users'
import { supabase } from './supabase'

export const DEFAULT_PER_PAGE = 9

/** False when Supabase env vars are unset. Auth then falls back to a local demo student. */
export const isBackendConfigured = supabase !== null

interface ProfileRow {
  id: string
  email: string
  name: string
  avatar_url: string | null
  role: 'student' | 'admin'
  banned_at: string | null
}

function toUser(row: ProfileRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatar_url,
    role: row.role,
    bannedAt: row.banned_at,
  }
}

/** Starts Google sign-in. The browser leaves the site and returns to `returnTo` afterwards. */
export async function signInWithGoogle(returnTo: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: returnTo,
      // A chooser hint only. The sign-up trigger in the database is what rejects other domains.
      queryParams: { hd: ALLOWED_EMAIL_DOMAINS[0], prompt: 'select_account' },
    },
  })
  if (error) throw error
}

export async function signOutUser(): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/** The signed-in student's profile, or null when signed out or no profile row exists. */
export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return DEMO_USER

  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user.id
  if (!userId) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, name, avatar_url, role, banned_at')
    .eq('id', userId)
    .maybeSingle<ProfileRow>()
  if (error) throw error
  return data ? toUser(data) : null
}

/** Calls `onChange` whenever the session changes. Returns an unsubscribe function. */
export function subscribeToAuthChanges(onChange: () => void): () => void {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
      // Deferred because awaiting Supabase calls inside this callback can deadlock the client.
      setTimeout(onChange, 0)
    }
  })
  return () => data.subscription.unsubscribe()
}

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
