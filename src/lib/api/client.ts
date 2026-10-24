// Data seam for Supabase email auth, bookmarks, and featured projects, plus mock feeds.
// Profile edits and viewing history remain private browser-only previews.

import type { AuthError } from '@supabase/supabase-js'
import type {
  AccountWorkspace,
  CommunityContributor,
  ProfilePreview,
  ViewedProject,
  Comment,
  FeaturedSelection,
  PersonPreview,
  Project,
  ProjectPage,
  ProjectQuery,
  RegistrationDetails,
  Sprint,
  TechnologyFacet,
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
  program: string | null
  study_year: string | null
  bio: string | null
}

const PROFILE_COLUMNS =
  'id, email, name, avatar_url, role, banned_at, registered_at, program, study_year, bio'

function toUser(row: ProfileRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatar_url,
    role: row.role,
    bannedAt: row.banned_at,
    registeredAt: row.registered_at,
    program: row.program,
    studyYear: row.study_year,
    bio: row.bio,
  }
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

// Trending needs per-upvote timestamps the mock store does not have, so it blends total
// engagement with how recently a project was posted. Once the upvotes table is live this
// becomes a count of distinct upvoters over the previous seven days.
function trendingScore(project: Project): number {
  const ageDays = Math.max(0, (Date.now() - Date.parse(project.createdAt)) / 86_400_000)
  return (project.upvoteCount + project.commentCount * 2) / (ageDays + 3)
}

function sortProjects(projects: Project[], sort: ProjectQuery['sort']): Project[] {
  const byUpvotes = (a: Project, b: Project) => b.upvoteCount - a.upvoteCount
  const compare =
    sort === 'new'
      ? (a: Project, b: Project) => b.createdAt.localeCompare(a.createdAt)
      : sort === 'trending'
        ? (a: Project, b: Project) => trendingScore(b) - trendingScore(a) || byUpvotes(a, b)
        : byUpvotes
  return [...projects].sort(compare)
}

function matchesSearch(project: Project, search: string): boolean {
  const haystack = [
    project.title,
    project.summary,
    project.authorName,
    ...project.tags,
    ...project.contributors.map((contributor) => contributor.name),
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(search.trim().toLowerCase())
}

function hasAllTechnologies(project: Project, technologies: string[]): boolean {
  const tags = project.tags.map((tag) => tag.toLowerCase())
  return technologies.every((technology) => tags.includes(technology.toLowerCase()))
}

function approvedProjects(): Project[] {
  return MOCK_PROJECTS.filter((project) => project.status === 'approved')
}

export async function listProjects({
  sort = 'top',
  sprintId,
  category = 'All',
  search = '',
  technologies = [],
  openToContributions = false,
  page = 1,
  perPage = DEFAULT_PER_PAGE,
}: ProjectQuery = {}): Promise<ProjectPage> {
  let matched = approvedProjects()
  if (sprintId) matched = matched.filter((project) => project.sprintId === sprintId)
  if (category !== 'All') matched = matched.filter((project) => project.category === category)
  if (search) matched = matched.filter((project) => matchesSearch(project, search))
  if (technologies.length > 0)
    matched = matched.filter((project) => hasAllTechnologies(project, technologies))
  if (openToContributions) matched = matched.filter((project) => project.openToContributions)

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

/** Best matches across every approved project, ranked for the command palette. */
export async function searchProjects(query: string, limit = 8): Promise<Project[]> {
  const text = query.trim().toLowerCase()
  if (!text) return []

  function score(project: Project): number {
    if (project.title.toLowerCase().startsWith(text)) return 4
    if (project.title.toLowerCase().includes(text)) return 3
    if (project.tags.some((tag) => tag.toLowerCase().includes(text))) return 2.5
    if (project.summary.toLowerCase().includes(text)) return 2
    if (project.authorName.toLowerCase().includes(text)) return 1.5
    if (project.contributors.some((contributor) => contributor.name.toLowerCase().includes(text)))
      return 1.5
    if (project.category.toLowerCase().includes(text)) return 1
    return 0
  }

  return approvedProjects()
    .map((project) => ({ project, score: score(project) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.project.upvoteCount - a.project.upvoteCount)
    .slice(0, limit)
    .map((entry) => entry.project)
}

/** Technology facets over every approved project, most used first. */
export async function listTechnologies(): Promise<TechnologyFacet[]> {
  const byKey = new Map<string, TechnologyFacet>()
  for (const project of approvedProjects()) {
    for (const tag of project.tags) {
      const key = tag.toLowerCase()
      const facet = byKey.get(key)
      if (facet) facet.projectCount += 1
      else byKey.set(key, { name: tag, projectCount: 1 })
    }
  }
  return [...byKey.values()].sort(
    (a, b) => b.projectCount - a.projectCount || a.name.localeCompare(b.name),
  )
}

/** Public details about a builder, assembled only from approved project records. */
export async function getPersonPreview({
  name,
  profileId,
  roleOnProject = null,
}: {
  name: string
  profileId?: string | null
  roleOnProject?: string | null
}): Promise<PersonPreview | null> {
  const approved = approvedProjects()
  const authored = profileId
    ? approved.filter((project) => project.authorId === profileId)
    : approved.filter((project) => project.authorName === name)
  const contributed = approved.filter((project) =>
    project.contributors.some(
      (contributor) => contributor.name.toLowerCase() === name.toLowerCase(),
    ),
  )

  const seen = new Set<string>()
  for (const project of [...authored, ...contributed]) seen.add(project.id)
  if (seen.size === 0) return null

  const authoredProject = authored[0] ?? null
  const contributorRecord = contributed
    .flatMap((project) => project.contributors)
    .find((contributor) => contributor.name.toLowerCase() === name.toLowerCase())

  return {
    name,
    avatarUrl: authoredProject?.authorAvatarUrl ?? contributorRecord?.avatarUrl ?? null,
    headline: authoredProject?.authorHeadline ?? null,
    roleOnProject,
    projectCount: seen.size,
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

// Bookmarks ---------------------------------------------------------------------------------

// Holds the demo fallback while Supabase is unset. A configured backend persists to the
// bookmarks table instead, where row level security keeps every row private to its owner.
const mockBookmarks = new Set<string>()

/** The ids of every project the signed-in viewer has saved, newest first. */
export async function listBookmarkedIds(): Promise<string[]> {
  if (!supabase) return [...mockBookmarks]

  const { data, error } = await supabase
    .from('bookmarks')
    .select('project_id, created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row) => row.project_id as string)
}

/** Saves or unsaves a project and returns the new saved state. */
export async function toggleBookmark(projectId: string): Promise<boolean> {
  if (!supabase) {
    if (mockBookmarks.has(projectId)) mockBookmarks.delete(projectId)
    else mockBookmarks.add(projectId)
    return mockBookmarks.has(projectId)
  }

  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user.id
  if (!userId) throw new Error('Sign in with your Ontario Tech account to save projects')

  const { data: existing, error: lookupError } = await supabase
    .from('bookmarks')
    .select('project_id')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .maybeSingle()
  if (lookupError) throw lookupError

  if (existing) {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('project_id', projectId)
    if (error) throw error
    return false
  }

  const { error } = await supabase
    .from('bookmarks')
    .insert({ user_id: userId, project_id: projectId })
  if (error) throw error
  return true
}

// Featured project --------------------------------------------------------------------------

// Demo fallback: the most upvoted approved project, featured for the current week.
let mockFeatured: FeaturedSelection | null = null

function currentWeekWindow(): { startsAt: string; endsAt: string } {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const toIsoDate = (date: Date) => date.toISOString().slice(0, 10)
  return { startsAt: toIsoDate(monday), endsAt: toIsoDate(sunday) }
}

function defaultFeatured(): FeaturedSelection | null {
  const top = [...approvedProjects()].sort((a, b) => b.upvoteCount - a.upvoteCount)[0]
  if (!top) return null
  return { project: top, ...currentWeekWindow() }
}

/** The project currently featured by an admin, or null when none is inside its window. */
export async function getFeaturedProject(): Promise<FeaturedSelection | null> {
  if (!supabase) return mockFeatured ?? defaultFeatured()

  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('featured_projects')
    .select('project:projects(*), starts_at, ends_at')
    .lte('starts_at', today)
    .gte('ends_at', today)
    .maybeSingle()
  if (error) throw error
  if (!data || !data.project) return null

  return {
    project: data.project as unknown as Project,
    startsAt: data.starts_at as string,
    endsAt: data.ends_at as string,
  }
}

/** Sets the featured project for a date window. Admins only; enforced again by row level security. */
export async function setFeaturedProject({
  projectId,
  startsAt,
  endsAt,
}: {
  projectId: string
  startsAt: string
  endsAt: string
}): Promise<FeaturedSelection | null> {
  const project = MOCK_PROJECTS.find(
    (candidate) => candidate.id === projectId && candidate.status === 'approved',
  )
  if (!project) throw new Error(`Unknown project: ${projectId}`)
  if (endsAt < startsAt) throw new Error('The feature window must end on or after it starts')

  if (!supabase) {
    mockFeatured = { project, startsAt, endsAt }
    return mockFeatured
  }

  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user.id
  if (!userId) throw new Error('Sign in as a coordinator to feature a project')

  const { error: clearError } = await supabase.from('featured_projects').delete()
  if (clearError) throw clearError

  const { error } = await supabase.from('featured_projects').insert({
    project_id: projectId,
    starts_at: startsAt,
    ends_at: endsAt,
    set_by: userId,
  })
  if (error) throw error

  return { project, startsAt, endsAt }
}

function readBrowserValue(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null') as unknown
  } catch {
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function previewKey(userId: string): string {
  return `launchpad:profile-preview:${encodeURIComponent(userId)}`
}

function historyKey(userId: string): string {
  return `launchpad:recent-projects:${encodeURIComponent(userId)}`
}

async function workspaceUser(userId: string): Promise<User> {
  const user = await getCurrentUser()
  if (!user || user.id !== userId || user.bannedAt)
    throw new Error('Sign in to view your workspace.')
  return user
}

function userProjects(userId: string): Project[] {
  return MOCK_PROJECTS.filter((project) => project.authorId === userId).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )
}

function profilePreview(user: User, projects: Project[]): ProfilePreview {
  const saved = readBrowserValue(previewKey(user.id))
  const values = isRecord(saved) ? saved : {}
  const text = (key: string, fallback = '') =>
    typeof values[key] === 'string' ? (values[key] as string) : fallback
  const eligible = new Set(
    projects.filter((project) => project.status === 'approved').map((project) => project.id),
  )
  const pins = Array.isArray(values.pinnedProjectIds)
    ? values.pinnedProjectIds
        .filter((id): id is string => typeof id === 'string' && eligible.has(id))
        .slice(0, 3)
    : []
  return {
    userId: user.id,
    name: text('name', user.name),
    program: text('program', user.program ?? ''),
    year: text('year', user.studyYear ?? ''),
    about: text('about', user.bio ?? ''),
    pinnedProjectIds: pins,
    updatedAt: text('updatedAt') || null,
  }
}

function viewedProjects(userId: string): ViewedProject[] {
  const value = readBrowserValue(historyKey(userId))
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  return value
    .flatMap((item: unknown) => {
      if (
        !isRecord(item) ||
        typeof item.projectId !== 'string' ||
        typeof item.viewedAt !== 'string' ||
        !Number.isFinite(Date.parse(item.viewedAt)) ||
        seen.has(item.projectId)
      )
        return []
      const project = MOCK_PROJECTS.find(
        (candidate) => candidate.id === item.projectId && candidate.status === 'approved',
      )
      if (!project) return []
      seen.add(project.id)
      return [{ project, viewedAt: item.viewedAt }]
    })
    .sort((a, b) => b.viewedAt.localeCompare(a.viewedAt))
    .slice(0, 8)
}

/** Profile previews and history are browser-only. They never update a public Supabase profile. */
export async function getAccountWorkspace(userId: string): Promise<AccountWorkspace> {
  const user = await workspaceUser(userId)
  const projects = userProjects(userId)
  return {
    profile: profilePreview(user, projects),
    projects,
    recentlyViewed: viewedProjects(userId),
  }
}

export async function saveProfilePreview(
  userId: string,
  input: ProfilePreview,
): Promise<ProfilePreview> {
  const user = await workspaceUser(userId)
  if (
    !input.name.trim() ||
    input.name.length > 100 ||
    input.about.length > 1000 ||
    input.program.length > 100 ||
    input.year.length > 30
  )
    throw new Error(
      'Enter a name of up to 100 characters and an About me of up to 1,000 characters.',
    )
  const eligible = new Set(
    userProjects(userId)
      .filter((project) => project.status === 'approved')
      .map((project) => project.id),
  )
  const next: ProfilePreview = {
    ...input,
    userId: user.id,
    name: input.name.trim(),
    about: input.about.trim(),
    pinnedProjectIds: [...new Set(input.pinnedProjectIds)]
      .filter((id) => eligible.has(id))
      .slice(0, 3),
    updatedAt: new Date().toISOString(),
  }
  try {
    localStorage.setItem(previewKey(userId), JSON.stringify(next))
  } catch {
    throw new Error('Your browser could not save the preview. Allow site storage and try again.')
  }
  return next
}

export async function recordProjectView(userId: string, projectId: string): Promise<void> {
  await workspaceUser(userId)
  if (!MOCK_PROJECTS.some((project) => project.id === projectId && project.status === 'approved'))
    return
  const next = [
    { projectId, viewedAt: new Date().toISOString() },
    ...viewedProjects(userId)
      .filter((entry) => entry.project.id !== projectId)
      .map((entry) => ({ projectId: entry.project.id, viewedAt: entry.viewedAt })),
  ].slice(0, 8)
  localStorage.setItem(historyKey(userId), JSON.stringify(next))
}

export async function clearRecentlyViewed(userId: string): Promise<void> {
  await workspaceUser(userId)
  localStorage.removeItem(historyKey(userId))
}

export async function listContributors(): Promise<CommunityContributor[]> {
  const people = new Map<string, CommunityContributor & { projectIds: Set<string> }>()
  for (const project of MOCK_PROJECTS.filter((item) => item.status === 'approved')) {
    const contributors = [
      {
        id: project.authorId,
        name: project.authorName,
        avatarUrl: project.authorAvatarUrl,
        role: 'Project creator',
      },
      ...project.contributors,
    ]
    for (const contributor of contributors) {
      const person = people.get(contributor.id) ?? {
        ...contributor,
        projectCount: 0,
        projectIds: new Set<string>(),
      }
      person.projectIds.add(project.id)
      person.projectCount = person.projectIds.size
      people.set(person.id, person)
    }
  }
  return [...people.values()]
    .map(({ projectIds: _projectIds, ...person }) => person)
    .sort((a, b) => b.projectCount - a.projectCount || a.name.localeCompare(b.name))
}
