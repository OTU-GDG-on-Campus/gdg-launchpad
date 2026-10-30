// The only data seam for authentication, public discovery, and private account pages.
// Configured backends never fall back to the isolated browser-local demo store.

import type { AuthError } from '@supabase/supabase-js'
import type {
  AccountProfile,
  OnboardingDetails,
  OnboardingDraft,
  ProfileLink,
  ProfileMediaKind,
  ActivityItem,
  ProfileDetails,
  PublicProfile,
  Comment,
  FeaturedSelection,
  PersonPreview,
  Project,
  ProjectPage,
  ProjectQuery,
  Sprint,
  TechnologyFacet,
  User,
} from '@/types'
import {
  demoActivity,
  demoComments,
  demoProjects,
  readDemo,
  resetDemo,
  writeDemo,
} from './mock/session'
import { normalizeProfile } from '@/lib/profile'
import {
  emptyOnboarding,
  normalizeOnboarding,
  profileToOnboarding,
  publicDeveloperDetails,
} from '@/lib/onboarding'
import { isAllowedStudentEmail } from '@/lib/auth/domain'
import { validateProfileImage } from '@/lib/profileImage'
import { MOCK_SPRINTS } from './mock/sprints'
import { isSupabaseConfigured, supabase as configuredClient } from '@/lib/supabase/client'

const supabase = isSupabaseConfigured ? configuredClient : null

export const DEFAULT_PER_PAGE = 9

/** False when Supabase env vars are unset. Auth then falls back to a local demo student. */
export const isBackendConfigured = supabase !== null

async function requireProfileOwner(): Promise<User> {
  const user = await getCurrentUser()
  if (!user || user.bannedAt)
    throw new Error(
      'Your session expired or your account is unavailable. Sign in again to continue.',
    )
  return user
}

export async function profileMediaUrl(
  kind: ProfileMediaKind,
  path: string | null,
): Promise<string | null> {
  if (!path || !supabase) return null
  const { data, error } = await supabase.storage
    .from(kind === 'avatar' ? 'profile-avatars' : 'profile-banners')
    .createSignedUrl(path, 3600)
  if (error) throw new Error('Could not load a profile image. Try refreshing the page.')
  return data.signedUrl
}

async function hydrateProfile(profile: PublicProfile, publicOnly: boolean): Promise<PublicProfile> {
  if (!supabase) return profile
  let query = supabase
    .from('profile_links')
    .select('id, platform, label, value, is_public')
    .eq('user_id', profile.id)
    .order('position')
  if (publicOnly) query = query.eq('is_public', true)
  const { data, error } =
    await query.returns<
      { id: string; platform: string; label: string; value: string; is_public: boolean }[]
    >()
  if (error)
    throw new Error('Could not load profile links. Check your connection and database migrations.')
  const developer = profile.developer
  return {
    ...profile,
    avatarUrl: developer?.avatarPath
      ? await profileMediaUrl('avatar', developer.avatarPath)
      : profile.avatarUrl,
    developer: developer
      ? { ...developer, bannerUrl: await profileMediaUrl('banner', developer.bannerPath) }
      : undefined,
    links: (data ?? []).map((link): ProfileLink => ({
      id: link.id,
      platform: link.platform,
      label: link.label,
      value: link.value,
      isPublic: link.is_public,
    })),
  }
}

export async function loadOnboardingDraft(): Promise<OnboardingDraft> {
  const user = await requireProfileOwner()
  if (!supabase) throw new Error('Saved onboarding requires a configured Supabase backend.')
  const { data, error } = await supabase
    .from('onboarding_drafts')
    .select('details, step, revision')
    .eq('user_id', user.id)
    .maybeSingle<{ details: Partial<OnboardingDetails>; step: number; revision: number }>()
  if (error)
    throw new Error(
      'Could not restore your saved progress. Check your connection and database migrations, then retry.',
    )
  let details = data
    ? { ...emptyOnboarding(), ...data.details }
    : user.registeredAt
      ? profileToOnboarding(await getMyProfile())
      : emptyOnboarding()
  // Expiring signed URLs are derived at read time and never stored in the private draft.
  details = {
    ...details,
    avatarUrl: details.avatarPath
      ? await profileMediaUrl('avatar', details.avatarPath)
      : details.avatarUrl,
    bannerUrl: await profileMediaUrl('banner', details.bannerPath),
  }
  return { details, step: data?.step ?? 3, revision: data?.revision ?? 0 }
}

export async function saveOnboardingDraft(
  details: OnboardingDetails,
  step: number,
  revision: number,
): Promise<number> {
  await requireProfileOwner()
  if (!supabase) throw new Error('Saving onboarding requires a configured Supabase backend.')
  const { data, error } = await supabase.rpc('save_onboarding_draft', {
    p_details: { ...details, avatarUrl: null, bannerUrl: null },
    p_step: step,
    p_revision: revision,
  })
  if (error)
    throw new Error(
      error.message.includes('another tab')
        ? error.message
        : 'Progress could not be saved. Check your connection or sign in again, then retry.',
    )
  return data as number
}

export async function publishDeveloperProfile(
  details: OnboardingDetails,
  revision: number,
): Promise<void> {
  const user = await requireProfileOwner()
  const normalized = normalizeOnboarding(details)
  if (!supabase) {
    if (!user.registeredAt) throw new Error('Registration requires a configured Supabase backend.')
    const state = readDemo()
    const name = normalized.displayName || `${normalized.firstName} ${normalized.lastName}`
    writeDemo({
      ...state,
      user: { ...user, name },
      profile: {
        ...state.profile,
        name,
        program: normalized.program,
        studyYear: normalized.studyYear,
        bio: normalized.bio,
        skills: normalized.skills,
        developer: publicDeveloperDetails(normalized),
        links: normalized.links,
        onboarding: normalized,
        githubUrl: null,
      },
    })
    return
  }
  const { error } = await supabase.rpc('publish_developer_profile', {
    p_details: { ...normalized, avatarUrl: null, bannerUrl: null },
    p_revision: revision,
  })
  if (error)
    throw new Error(
      error.message.includes('another tab')
        ? error.message
        : 'Your profile could not be saved. Check your connection, sign in again if needed, and retry.',
    )
  void cleanupProfileMedia(normalized).catch(() => {})
}

export async function removeProfileMedia(kind: ProfileMediaKind, path: string): Promise<void> {
  const user = await requireProfileOwner()
  if (!supabase || path.split('/')[0] !== user.id)
    throw new Error('You can only remove your own images.')
  const { error } = await supabase.storage
    .from(kind === 'avatar' ? 'profile-avatars' : 'profile-banners')
    .remove([path])
  if (error) throw new Error('Could not remove the old image. You can retry later.')
}

async function cleanupProfileMedia(details: OnboardingDetails) {
  const user = await requireProfileOwner()
  if (!supabase) return
  for (const kind of ['avatar', 'banner'] as const) {
    const bucket = supabase.storage.from(kind === 'avatar' ? 'profile-avatars' : 'profile-banners')
    const { data, error } = await bucket.list(user.id, { limit: 100 })
    if (error) continue
    const unused = (data ?? [])
      .filter(
        (file) =>
          file.created_at &&
          `${user.id}/${file.name}` !== details[`${kind}Path`] &&
          Date.now() - Date.parse(file.created_at) > 24 * 60 * 60 * 1000,
      )
      .map((file) => `${user.id}/${file.name}`)
    if (unused.length) await bucket.remove(unused)
  }
}

export async function uploadProfileMedia(
  file: File,
  kind: ProfileMediaKind,
  onProgress: (percent: number) => void,
): Promise<{ path: string; url: string }> {
  validateProfileImage(file, kind)
  const user = await requireProfileOwner()
  if (!supabase)
    throw new Error('Image uploads require Supabase Storage. Demo accounts cannot upload files.')
  const bucket = supabase.storage.from(kind === 'avatar' ? 'profile-avatars' : 'profile-banners')
  const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type]
  const path = `${user.id}/${crypto.randomUUID()}.${extension}`
  const { data, error } = await bucket.createSignedUploadUrl(path)
  if (error)
    throw new Error(
      'Could not authorize this upload. Check your session and Storage configuration.',
    )
  try {
    await new Promise<void>((resolve, reject) => {
      const request = new XMLHttpRequest()
      request.open('PUT', data.signedUrl)
      request.timeout = 120_000
      request.setRequestHeader('x-upsert', 'false')
      request.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
      }
      request.onload = () =>
        request.status >= 200 && request.status < 300
          ? resolve()
          : reject(
              new Error('Image upload failed. Check the file size, session, and Storage policies.'),
            )
      request.onerror =
        request.ontimeout =
        request.onabort =
          () =>
            reject(new Error('The image upload was interrupted. Check your connection and retry.'))
      const body = new FormData()
      body.append('cacheControl', '3600')
      body.append('', file)
      request.send(body)
    })
    const url = await profileMediaUrl(kind, path)
    if (!url) throw new Error('Could not preview the uploaded image.')
    onProgress(100)
    return { path, url }
  } catch (cause) {
    await bucket.remove([path]).catch(() => {})
    throw cause
  }
}

interface ProfileRow {
  id: string
  email: string
  name: string
  avatar_url: string | null
  avatar_path?: string | null
  role: 'student' | 'admin'
  banned_at: string | null
  registered_at: string | null
}

const PROFILE_COLUMNS = 'id, email, name, avatar_url, avatar_path, role, banned_at, registered_at'

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
  if (!isAllowedStudentEmail(email))
    throw new Error('Use a valid Ontario Tech student email address.')
  if (!supabase)
    throw new Error(
      'Email authentication requires a configured Supabase backend. You can use the separate demo account on the login page.',
    )
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { shouldCreateUser: mode === 'register' },
  })
  if (error) throw new Error(authMessage(error, 'Could not send the code. Try again.'))
}

/** Exchanges the emailed code for a session. */
export async function verifyEmailCode(email: string, code: string): Promise<void> {
  if (!isAllowedStudentEmail(email) || !/^\d{6}$/.test(code.trim()))
    throw new Error('Enter your university email and six-digit verification code.')
  if (!supabase) throw new Error('Email verification requires a configured Supabase backend.')
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
  if (!supabase) {
    writeDemo({ ...readDemo(), signedIn: false })
    return
  }
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/** The signed-in student's profile, or null when signed out or no profile row exists. */
export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) {
    const state = readDemo()
    return state.signedIn ? state.user : null
  }

  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user.id
  if (!userId) return null

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle<ProfileRow>()
  if (error) throw error
  return data
    ? toUser({
        ...data,
        avatar_url: data.avatar_path
          ? await profileMediaUrl('avatar', data.avatar_path).catch(() => null)
          : data.avatar_url,
      })
    : null
}

/** Calls `onChange` whenever the session changes. Returns an unsubscribe function. */
export function subscribeToAuthChanges(onChange: () => void): () => void {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((event) => {
    if (
      event === 'SIGNED_IN' ||
      event === 'SIGNED_OUT' ||
      event === 'USER_UPDATED' ||
      event === 'TOKEN_REFRESHED'
    ) {
      // Deferred because awaiting Supabase calls inside this callback can deadlock the client.
      setTimeout(onChange, 0)
    }
  })
  return () => data.subscription.unsubscribe()
}

// Trending remains a derived engagement score, not a seven-day count of distinct upvoters.
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

async function approvedProjects(): Promise<Project[]> {
  return loadProjects({ approvedOnly: true })
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
  let matched = await approvedProjects()
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

  return (await approvedProjects())
    .map((project) => ({ project, score: score(project) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.project.upvoteCount - a.project.upvoteCount)
    .slice(0, limit)
    .map((entry) => entry.project)
}

/** Technology facets over every approved project, most used first. */
export async function listTechnologies(): Promise<TechnologyFacet[]> {
  const byKey = new Map<string, TechnologyFacet>()
  for (const project of await approvedProjects()) {
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
  const approved = await approvedProjects()
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
  const projects = await loadProjects({ slug })
  return projects[0] ?? null
}

/** Toggles the viewer's upvote and returns the updated project. Server enforces one per user. */
export async function toggleUpvote(projectId: string): Promise<Project> {
  const user = await requireParticipant()
  const project = (await loadProjects({ ids: [projectId], approvedOnly: true }))[0]
  if (!project) throw new Error('This project is unavailable.')
  if (!supabase) {
    const state = readDemo()
    const votes = { ...state.votes }
    if (votes[projectId]) delete votes[projectId]
    else votes[projectId] = new Date().toISOString()
    writeDemo({ ...state, votes })
  } else {
    const result = project.viewerHasUpvoted
      ? await supabase.from('upvotes').delete().eq('user_id', user.id).eq('project_id', projectId)
      : await supabase.from('upvotes').insert({ user_id: user.id, project_id: projectId })
    if (result.error) throw result.error
  }
  const updated = (await loadProjects({ ids: [projectId], approvedOnly: true }))[0]
  if (!updated) throw new Error('This project is unavailable.')
  return updated
}

export async function listComments(projectId: string): Promise<Comment[]> {
  if (!projectId) return []
  if (!supabase) {
    const project = await getProjectById(projectId)
    if (!project) return []
    return demoComments()
      .filter((comment) => comment.projectId === projectId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }
  const { data, error } = await supabase
    .from('comments')
    .select('id, project_id, author_id, body, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .returns<CommentRow[]>()
  if (error) throw error
  const profiles = await publicProfiles((data ?? []).map((row) => row.author_id))
  return (data ?? []).map((row) => ({
    id: row.id,
    projectId: row.project_id,
    authorId: row.author_id,
    authorName: profiles.find((profile) => profile.id === row.author_id)?.name ?? 'Student',
    authorAvatarUrl: profiles.find((profile) => profile.id === row.author_id)?.avatar_url ?? null,
    body: row.body,
    createdAt: row.created_at,
  }))
}

export async function listSprints(): Promise<Sprint[]> {
  let sprints = MOCK_SPRINTS
  if (supabase) {
    const { data, error } = await supabase
      .from('sprints')
      .select('*, projects(count)')
      .returns<SprintRow[]>()
    if (error) throw error
    sprints = (data ?? []).map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      theme: row.theme,
      description: row.description,
      status: row.status,
      startDate: row.start_date,
      endDate: row.end_date,
      montageUrl: row.montage_url,
      projectCount: row.projects?.[0]?.count ?? 0,
    }))
  }
  const order: Record<Sprint['status'], number> = { active: 0, upcoming: 1, completed: 2 }
  return [...sprints].sort(
    (a, b) => order[a.status] - order[b.status] || a.startDate.localeCompare(b.startDate),
  )
}

export async function getSprintBySlug(slug: string): Promise<Sprint | null> {
  return (await listSprints()).find((sprint) => sprint.slug === slug) ?? null
}

// Bookmarks ---------------------------------------------------------------------------------

// Holds the demo fallback while Supabase is unset. A configured backend persists to the
// bookmarks table instead, where row level security keeps every row private to its owner.

/** The ids of every project the signed-in viewer has saved, newest first. */
export async function listBookmarkedIds(): Promise<string[]> {
  const user = await getCurrentUser()
  if (!user || user.bannedAt || !user.registeredAt) return []
  if (!supabase)
    return Object.entries(readDemo().saved)
      .sort((a, b) => b[1].localeCompare(a[1]))
      .map(([id]) => id)

  const { data, error } = await supabase
    .from('bookmarks')
    .select('project_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row) => row.project_id as string)
}

/** Saves or unsaves a project and returns the new saved state. */
export async function toggleBookmark(projectId: string): Promise<boolean> {
  const user = await requireParticipant()
  const userId = user.id
  if (!supabase) {
    const state = readDemo()
    const saved = { ...state.saved }
    if (saved[projectId]) delete saved[projectId]
    else {
      if (!(await loadProjects({ ids: [projectId], approvedOnly: true })).length)
        throw new Error('This project is unavailable.')
      saved[projectId] = new Date().toISOString()
    }
    writeDemo({ ...state, saved })
    return Boolean(saved[projectId])
  }

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

async function defaultFeatured(): Promise<FeaturedSelection | null> {
  const top = [...(await approvedProjects())].sort((a, b) => b.upvoteCount - a.upvoteCount)[0]
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

  const row = data.project as unknown as { id: string }
  const project = await getProjectById(row.id)
  if (!project || project.status !== 'approved') return null
  return {
    project,
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
  const project = (await loadProjects({ ids: [projectId], approvedOnly: true }))[0]
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

interface PublicProfileRow {
  id: string
  name: string
  avatar_url: string | null
  headline: string | null
  program: string | null
  study_year: string | null
  skills: string[]
  bio: string | null
  github_url: string | null
  introduction?: string
  graduation_year?: number | null
  languages?: string[]
  frameworks?: string[]
  tools?: string[]
  interests?: string[]
  preferred_roles?: string[]
  collaboration?: string[]
  avatar_path?: string | null
  banner_path?: string | null
}
interface AccountProfileRow extends PublicProfileRow {
  email: string
  first_name?: string
  last_name?: string
}
interface ProjectRow {
  id: string
  slug: string
  title: string
  summary: string
  description: string
  category: Project['category']
  tags: string[]
  repo_url: string | null
  live_url: string | null
  cover_image_url: string | null
  screenshot_urls: string[]
  author_id: string
  sprint_id: string | null
  status: Project['status']
  upvote_count: number
  comment_count: number
  open_to_contributions: boolean
  created_at: string
  project_contributors: {
    id: string
    name: string
    avatar_url: string | null
    role: string | null
  }[]
}
interface CommentRow {
  id: string
  project_id: string
  author_id: string
  body: string
  created_at: string
}
interface SprintRow {
  id: string
  slug: string
  title: string
  theme: string
  description: string
  status: Sprint['status']
  start_date: string
  end_date: string
  montage_url: string | null
  projects: { count: number }[]
}

const PUBLIC_PROFILE_COLUMNS =
  'id, name, avatar_url, headline, program, study_year, skills, bio, github_url, introduction, graduation_year, languages, frameworks, tools, interests, preferred_roles, collaboration, avatar_path, banner_path'

function toPublicProfile(row: PublicProfileRow): PublicProfile {
  return {
    id: row.id,
    name: row.name,
    avatarUrl: row.avatar_url,
    program: row.program ?? '',
    studyYear: row.study_year ?? '',
    skills: row.skills,
    bio: row.bio ?? '',
    githubUrl: row.github_url,
    developer: {
      headline: row.headline ?? '',
      introduction: row.introduction ?? '',
      graduationYear: row.graduation_year?.toString() ?? '',
      languages: row.languages ?? [],
      frameworks: row.frameworks ?? [],
      tools: row.tools ?? [],
      interests: row.interests ?? [],
      roles: row.preferred_roles ?? [],
      collaboration: row.collaboration ?? [],
      avatarPath: row.avatar_path ?? null,
      bannerPath: row.banner_path ?? null,
      bannerUrl: null,
    },
  }
}

async function publicProfiles(ids: string[]): Promise<PublicProfileRow[]> {
  if (!supabase || !ids.length) return []
  const { data, error } = await supabase
    .from('public_profiles')
    .select(PUBLIC_PROFILE_COLUMNS)
    .in('id', [...new Set(ids)])
    .returns<PublicProfileRow[]>()
  if (error)
    throw new Error(
      'Could not load public profiles. Apply the personal-pages database migration and try again.',
    )
  return Promise.all(
    (data ?? []).map(async (row) => ({
      ...row,
      avatar_url: row.avatar_path
        ? await profileMediaUrl('avatar', row.avatar_path)
        : row.avatar_url,
    })),
  )
}

async function requireParticipant(): Promise<User> {
  const user = await getCurrentUser()
  if (!user || user.bannedAt || !user.registeredAt)
    throw new Error('Sign in with a completed, active student account to continue.')
  return user
}

async function loadProjects({
  ownerId,
  slug,
  ids,
  approvedOnly = false,
}: { ownerId?: string; slug?: string; ids?: string[]; approvedOnly?: boolean } = {}): Promise<
  Project[]
> {
  if (ids?.length === 0) return []
  if (!supabase) {
    const state = readDemo()
    return demoProjects().filter(
      (project) =>
        (project.status === 'approved' ||
          (state.signedIn &&
            state.user.registeredAt &&
            !state.user.bannedAt &&
            project.authorId === state.user.id)) &&
        (!approvedOnly || project.status === 'approved') &&
        (!ownerId || project.authorId === ownerId) &&
        (!slug || project.slug === slug) &&
        (!ids || ids.includes(project.id)),
    )
  }
  let query = supabase
    .from('projects')
    .select('*, project_contributors(id, name, avatar_url, role)')
  if (ownerId) query = query.eq('author_id', ownerId)
  if (slug) query = query.eq('slug', slug)
  if (ids) query = query.in('id', ids)
  if (approvedOnly) query = query.eq('status', 'approved')
  const { data, error } = await query.returns<ProjectRow[]>()
  if (error) throw error
  const rows = data ?? []
  const profiles = await publicProfiles(rows.map((row) => row.author_id))
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  const userId = sessionData.session?.user.id
  let voted = new Set<string>()
  if (userId && rows.length) {
    const { data: votes, error: votesError } = await supabase
      .from('upvotes')
      .select('project_id')
      .eq('user_id', userId)
      .in(
        'project_id',
        rows.map((row) => row.id),
      )
    if (votesError) throw votesError
    voted = new Set((votes ?? []).map((vote) => vote.project_id as string))
  }
  return rows.map((row) => {
    const author = profiles.find((profile) => profile.id === row.author_id)
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      description: row.description,
      category: row.category,
      tags: row.tags,
      repoUrl: row.repo_url,
      liveUrl: row.live_url,
      coverImageUrl: row.cover_image_url,
      screenshotUrls: row.screenshot_urls,
      authorId: row.author_id,
      authorName: author?.name ?? 'Student',
      authorAvatarUrl: author?.avatar_url ?? null,
      authorHeadline:
        author?.headline || [author?.program, author?.study_year].filter(Boolean).join(' ') || null,
      sprintId: row.sprint_id,
      status: row.status,
      upvoteCount: row.upvote_count,
      viewerHasUpvoted: voted.has(row.id),
      commentCount: row.comment_count,
      openToContributions: row.open_to_contributions,
      contributors: (row.project_contributors ?? []).map((person) => ({
        id: person.id,
        name: person.name,
        avatarUrl: person.avatar_url,
        role: person.role,
      })),
      createdAt: row.created_at,
    }
  })
}

async function getProjectById(id: string): Promise<Project | null> {
  return (await loadProjects({ ids: [id] }))[0] ?? null
}

export async function signInDemo(): Promise<User> {
  if (supabase) throw new Error('Demo login is unavailable with a configured backend.')
  const state = readDemo()
  const user = { ...state.user, registeredAt: state.user.registeredAt ?? new Date().toISOString() }
  writeDemo({ ...state, user, signedIn: true })
  return user
}

export async function resetDemoData(): Promise<User> {
  if (supabase) throw new Error('Demo reset is unavailable with a configured backend.')
  return resetDemo().user
}

export async function getMyProfile(): Promise<AccountProfile> {
  const user = await requireParticipant()
  if (!supabase) return readDemo().profile
  const { data, error } = await supabase
    .from('profiles')
    .select(`${PUBLIC_PROFILE_COLUMNS}, email, first_name, last_name`)
    .eq('id', user.id)
    .single<AccountProfileRow>()
  if (error)
    throw new Error(
      'Could not load your profile. Check that the personal-pages migration is applied.',
    )
  const profile = await hydrateProfile(toPublicProfile(data), false)
  const account = { ...profile, email: data.email }
  return {
    ...account,
    onboarding: {
      ...profileToOnboarding(account),
      firstName: data.first_name ?? '',
      lastName: data.last_name ?? '',
    },
  }
}

export async function updateMyProfile(details: ProfileDetails): Promise<AccountProfile> {
  const user = await requireParticipant()
  const normalized = normalizeProfile(details)
  if (!supabase) {
    const state = readDemo()
    writeDemo({
      ...state,
      user: { ...state.user, name: normalized.name },
      profile: { ...state.profile, ...normalized, githubUrl: normalized.githubUrl || null },
    })
  } else {
    const { error } = await supabase
      .from('profiles')
      .update({
        name: normalized.name,
        program: normalized.program,
        study_year: normalized.studyYear,
        skills: normalized.skills,
        bio: normalized.bio || null,
        github_url: normalized.githubUrl || null,
      })
      .eq('id', user.id)
      .select('id')
      .single()
    if (error)
      throw new Error(
        'Could not save your profile. Check your connection and database migrations, then try again.',
      )
  }
  return getMyProfile()
}

export async function getPublicProfile(id: string): Promise<PublicProfile | null> {
  if (!supabase) {
    const { profile, user } = readDemo()
    if (id !== user.id || user.bannedAt || !user.registeredAt) return null
    return {
      id: profile.id,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      program: profile.program,
      studyYear: profile.studyYear,
      skills: profile.skills,
      bio: profile.bio,
      githubUrl: profile.githubUrl,
      developer: profile.developer,
      links: profile.links?.filter((link) => link.isPublic),
    }
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null
  const profile = (await publicProfiles([id])).map(toPublicProfile)[0]
  return profile ? hydrateProfile(profile, true) : null
}

export async function listMyProjects(): Promise<Project[]> {
  const user = await requireParticipant()
  return (await loadProjects({ ownerId: user.id })).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )
}

export async function listPublicProfileProjects(id: string): Promise<Project[]> {
  if (!(await getPublicProfile(id))) return []
  return (await loadProjects({ ownerId: id, approvedOnly: true })).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )
}

export async function listSavedProjects(): Promise<Project[]> {
  await requireParticipant()
  const ids = await listBookmarkedIds()
  const projects = await loadProjects({ ids, approvedOnly: true })
  return ids.flatMap((id) => projects.filter((project) => project.id === id))
}

export async function listMySprints(): Promise<Sprint[]> {
  const projects = await listMyProjects()
  const ids = new Set(projects.map((project) => project.sprintId).filter(Boolean))
  return (await listSprints()).filter((sprint) => ids.has(sprint.id))
}

export async function listMyActivity(): Promise<ActivityItem[]> {
  const user = await requireParticipant()
  if (!supabase) return demoActivity()
  const [projects, bookmarks, votes, comments] = await Promise.all([
    listMyProjects(),
    supabase.from('bookmarks').select('project_id, created_at').eq('user_id', user.id),
    supabase.from('upvotes').select('project_id, created_at').eq('user_id', user.id),
    supabase.from('comments').select('id, project_id, created_at').eq('author_id', user.id),
  ])
  for (const result of [bookmarks, votes, comments]) if (result.error) throw result.error
  const items: ActivityItem[] = projects.map((project) => ({
    id: `project-${project.id}`,
    kind: 'project',
    projectId: project.id,
    title: project.title,
    slug: project.slug,
    createdAt: project.createdAt,
  }))
  const relatedIds = [
    ...(bookmarks.data ?? []),
    ...(votes.data ?? []),
    ...(comments.data ?? []),
  ].map((row) => row.project_id as string)
  const related = await loadProjects({ ids: [...new Set(relatedIds)] })
  for (const [kind, rows] of [
    ['bookmark', bookmarks.data],
    ['upvote', votes.data],
    ['comment', comments.data],
  ] as const) {
    for (const row of rows ?? []) {
      const project = related.find((candidate) => candidate.id === row.project_id)
      if (project)
        items.push({
          id: `${kind}-${'id' in row ? String(row.id) : project.id}`,
          kind,
          projectId: project.id,
          title: project.title,
          slug: project.slug,
          createdAt: row.created_at as string,
        })
    }
  }
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 100)
}

/** Idempotent removal avoids re-saving a bookmark changed in another tab. */
export async function removeBookmark(projectId: string): Promise<void> {
  const user = await requireParticipant()
  if (!supabase) {
    const state = readDemo()
    const saved = { ...state.saved }
    delete saved[projectId]
    writeDemo({ ...state, saved })
    return
  }
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', user.id)
    .eq('project_id', projectId)
  if (error) throw error
}
