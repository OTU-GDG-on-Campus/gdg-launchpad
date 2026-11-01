// Versioned, browser-local demo fixtures and persistence. Only the API seam uses this store.

import { MOCK_PROJECTS } from './projects'
import { MOCK_COMMENTS } from './comments'
import { DEMO_USER } from './users'
import type { AccountProfile, ActivityItem, Comment, Project, User } from '@/types'

const STORAGE_KEY = 'launchpad-demo-v1'

export interface DemoState {
  user: User
  profile: AccountProfile
  signedIn: boolean
  saved: Record<string, string>
  votes: Record<string, string>
}

function initialState(): DemoState {
  return {
    user: { ...DEMO_USER, name: 'Alex Morgan' },
    profile: {
      id: DEMO_USER.id,
      name: 'Alex Morgan',
      email: DEMO_USER.email,
      avatarUrl: null,
      program: 'Computer Science',
      studyYear: 'Year 2',
      skills: ['TypeScript', 'React', 'Python'],
      bio: 'Building useful little tools and learning alongside other students.',
      githubUrl: null,
    },
    signedIn: false,
    saved: Object.fromEntries(
      MOCK_PROJECTS.slice(0, 3).map((project, index) => [
        project.id,
        new Date(Date.UTC(2026, 9, 20 - index)).toISOString(),
      ]),
    ),
    votes: { [MOCK_PROJECTS[0].id]: '2026-10-21T12:00:00.000Z' },
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isDateMap(value: unknown): boolean {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (date) => typeof date === 'string' && Number.isFinite(Date.parse(date)),
    )
  )
}

function isDemoState(value: unknown): value is DemoState {
  if (!isRecord(value) || !isRecord(value.user) || !isRecord(value.profile)) return false
  const { user, profile } = value
  return (
    typeof value.signedIn === 'boolean' &&
    isDateMap(value.saved) &&
    isDateMap(value.votes) &&
    user.id === DEMO_USER.id &&
    user.role === 'student' &&
    typeof user.name === 'string' &&
    typeof user.email === 'string' &&
    /^[^@]+@ontariotechu\.(net|ca)$/.test(user.email) &&
    (user.avatarUrl === null || typeof user.avatarUrl === 'string') &&
    (user.bannedAt === null || typeof user.bannedAt === 'string') &&
    (user.registeredAt === null || typeof user.registeredAt === 'string') &&
    profile.id === user.id &&
    profile.email === user.email &&
    typeof profile.name === 'string' &&
    (profile.avatarUrl === null || typeof profile.avatarUrl === 'string') &&
    typeof profile.program === 'string' &&
    typeof profile.studyYear === 'string' &&
    typeof profile.bio === 'string' &&
    Array.isArray(profile.skills) &&
    profile.skills.every((skill) => typeof skill === 'string') &&
    (profile.githubUrl === null || typeof profile.githubUrl === 'string')
  )
}

export function readDemo(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (isDemoState(parsed)) return parsed
    }
  } catch {
    /* Storage may be unavailable in private browsing. */
  }
  return memoryState ?? initialState()
}

let memoryState: DemoState | null = null

export function writeDemo(state: DemoState): void {
  memoryState = state
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* Keep this session usable without persistent storage. */
  }
}

export function resetDemo(): DemoState {
  const state = { ...initialState(), signedIn: true }
  writeDemo(state)
  return state
}

export function demoProjects(): Project[] {
  const state = readDemo()
  const base = MOCK_PROJECTS.map((project) => ({
    ...project,
    authorName: project.authorId === state.user.id ? state.profile.name : project.authorName,
    authorHeadline:
      project.authorId === state.user.id
        ? `${state.profile.program} ${state.profile.studyYear}`
        : project.authorHeadline,
    viewerHasUpvoted: state.signedIn && Boolean(state.votes[project.id]),
    upvoteCount: project.upvoteCount + (state.votes[project.id] ? 1 : 0),
  }))
  const template = base.find((project) => project.authorId === state.user.id) ?? base[0]
  return [
    ...base,
    {
      ...template,
      id: 'demo-project-pending',
      slug: 'demo-campus-compass',
      title: 'Campus Compass',
      summary: 'A small guide to finding useful study spaces around campus.',
      status: 'pending',
      upvoteCount: 0,
      viewerHasUpvoted: false,
      commentCount: 0,
      createdAt: '2026-10-24T12:00:00.000Z',
    },
    {
      ...template,
      id: 'demo-project-rejected',
      slug: 'demo-study-buddy',
      title: 'Study Buddy Experiment',
      summary: 'An early prototype for matching study interests and availability.',
      status: 'rejected',
      upvoteCount: 0,
      viewerHasUpvoted: false,
      commentCount: 0,
      createdAt: '2026-10-22T12:00:00.000Z',
    },
  ]
}

export function demoActivity(): ActivityItem[] {
  const state = readDemo()
  const projects = demoProjects()
  const entries: ActivityItem[] = projects
    .filter((project) => project.authorId === state.user.id)
    .map((project) => ({
      id: `project-${project.id}`,
      kind: 'project',
      projectId: project.id,
      title: project.title,
      slug: project.slug,
      createdAt: project.createdAt,
    }))
  for (const [kind, records] of [
    ['bookmark', state.saved],
    ['upvote', state.votes],
  ] as const) {
    for (const [id, createdAt] of Object.entries(records)) {
      const project = projects.find(
        (candidate) => candidate.id === id && candidate.status === 'approved',
      )
      if (project)
        entries.push({
          id: `${kind}-${id}`,
          kind,
          projectId: id,
          title: project.title,
          slug: project.slug,
          createdAt,
        })
    }
  }
  for (const comment of demoComments().filter((item) => item.authorId === state.user.id)) {
    const project = projects.find(
      (item) => item.id === comment.projectId && item.status === 'approved',
    )
    if (project)
      entries.push({
        id: comment.id,
        kind: 'comment',
        projectId: project.id,
        title: project.title,
        slug: project.slug,
        createdAt: comment.createdAt,
      })
  }
  return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function demoComments(): Comment[] {
  const state = readDemo()
  return [
    ...MOCK_COMMENTS,
    {
      id: 'demo-comment',
      projectId: MOCK_PROJECTS[0].id,
      authorId: state.user.id,
      authorName: state.profile.name,
      authorAvatarUrl: null,
      body: 'I would love to help test the next version. The setup guide was a useful starting point.',
      createdAt: '2026-10-23T13:30:00.000Z',
    },
  ]
}
