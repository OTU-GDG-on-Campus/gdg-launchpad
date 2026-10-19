// The single seam between UI and data. Auth goes through Supabase when configured, the rest still
// reads mock arrays, so swapping those for Supabase queries touches this file and nothing else.

import type { AuthError } from '@supabase/supabase-js'
import { ALLOWED_EMAIL_DOMAINS } from '@/config/site'
import type {
  Comment,
  Project,
  ProjectPage,
  ProjectQuery,
  RegistrationDetails,
  Sprint,
  User,
} from '@/types'
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
  registered_at: string | null
}

const PROFILE_COLUMNS = 'id, email, name, avatar_url, role, banned_at, registered_at'

function toUser(row: ProfileRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatar_url,
    role: row.role,
    bannedAt: row.banned_at,
    registeredAt: row.registered_at,
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

function authMessage(error: AuthError, fallback: string): string {
  if (error.code === 'otp_disabled' || /signups not allowed/i.test(error.message)) {
    return 'No account found for that email. Create an account first.'
  }
  if (error.status === 429 || /rate limit|seconds/i.test(error.message)) {
    return 'Too many attempts. Wait a minute and try again.'
  }
  // A failed sign-up trigger surfaces as this generic message, and the domain rule is its only check.
  if (/database error saving new user|ontariotechu/i.test(error.message)) {
    return 'LaunchPad accounts require an Ontario Tech email address.'
  }
  return fallback
}

/** Emails a six digit code. Only registering may create an account, logging in never does. */
export async function sendEmailCode(email: string, mode: 'login' | 'register'): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { shouldCreateUser: mode === 'register' },
  })
  if (error) throw new Error(authMessage(error, 'Could not send the code. Try again.'))
}

/** Exchanges the emailed code for a session. */
export async function verifyEmailCode(email: string, code: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: code.trim(),
    type: 'email',
  })
  if (error) {
    throw new Error(authMessage(error, 'That code is wrong or has expired. Request a new one.'))
  }
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
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle<ProfileRow>()
  if (error) throw error
  return data ? toUser(data) : null
}

/** Demo mode only: an unregistered demo student for `email`, so the register flow can be previewed. */
export function startDemoRegistration(email: string): User {
  const address = email.trim().toLowerCase()
  return { ...DEMO_USER, email: address, name: address.split('@')[0], registeredAt: null }
}

/** Saves the registration details onto the signed-in student's profile and marks it finished. */
export async function saveRegistration(user: User, details: RegistrationDetails): Promise<User> {
  if (!supabase) {
    return { ...user, name: details.name, registeredAt: new Date().toISOString() }
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      name: details.name,
      program: details.program,
      study_year: details.studyYear,
      skills: details.skills,
      bio: details.bio || null,
      registered_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select(PROFILE_COLUMNS)
    .single<ProfileRow>()
  if (error) throw new Error('Could not save your details. Try again.')
  return toUser(data)
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
