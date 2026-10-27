// Configured Supabase contract tests with intercepted transport; no real network or accounts.

import assert from 'node:assert/strict'
import { after, beforeEach, test } from 'node:test'
import { createServer } from 'vite'

const userId = '11111111-1111-4111-8111-111111111111'
const profile = {
  id: userId,
  name: 'Backend Student',
  email: 'backend@ontariotechu.net',
  avatar_url: null,
  headline: 'CS Year 2',
  role: 'student',
  banned_at: null,
  registered_at: '2026-10-01T00:00:00Z',
  program: 'Computer Science',
  study_year: 'Year 2',
  skills: ['React'],
  bio: 'A backend fixture.',
  github_url: null,
}
const {
  email: _email,
  role: _role,
  banned_at: _ban,
  registered_at: _registered,
  ...publicProfile
} = profile
const baseProject = {
  id: 'b0000000-0000-4000-8000-000000000001',
  slug: 'backend-project',
  title: 'Backend Project',
  summary: 'A configured backend project fixture.',
  description: 'A useful example.',
  category: 'Web App',
  tags: ['React'],
  repo_url: null,
  live_url: null,
  cover_image_url: null,
  screenshot_urls: [],
  author_id: userId,
  sprint_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  status: 'approved',
  upvote_count: 3,
  comment_count: 1,
  open_to_contributions: true,
  created_at: '2026-10-20T12:00:00Z',
  project_contributors: [
    { id: 'contributor-1', name: 'A Teammate', avatar_url: null, role: 'Design' },
  ],
}
const pendingProject = {
  ...baseProject,
  id: 'b0000000-0000-4000-8000-000000000002',
  slug: 'backend-private',
  title: 'Private Backend Project',
  status: 'pending',
}
const calls = []
let failTable = null
let saved = true
const originalFetch = globalThis.fetch

globalThis.fetch = async (input, init = {}) => {
  const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url)
  assert.equal(url.origin, 'http://127.0.0.1:54321', 'tests must not contact an external service')
  const method = init.method ?? (input instanceof Request ? input.method : 'GET')
  const headers = new Headers(
    init.headers ?? (input instanceof Request ? input.headers : undefined),
  )
  const body = typeof init.body === 'string' ? JSON.parse(init.body) : null
  calls.push({ url, method, body })
  function respond(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  if (url.pathname === '/auth/v1/user')
    return respond({
      id: userId,
      email: profile.email,
      aud: 'authenticated',
      role: 'authenticated',
      created_at: '2026-10-01T00:00:00Z',
      app_metadata: {},
      user_metadata: {},
    })
  if (url.pathname === '/auth/v1/logout') return respond({})
  const table = url.pathname.split('/').at(-1)
  if (table === failTable)
    return respond({ message: 'Database fixture unavailable', code: '42P01' }, 400)
  let rows = []
  if (table === 'profiles') {
    if (method === 'PATCH') Object.assign(profile, body)
    rows = url.searchParams.get('id') === `eq.${userId}` ? [profile] : []
  }
  if (table === 'public_profiles') rows = [publicProfile]
  if (table === 'projects') {
    rows = [baseProject, pendingProject]
    if (url.searchParams.get('status') === 'eq.approved')
      rows = rows.filter((row) => row.status === 'approved')
    const slug = url.searchParams.get('slug')?.slice(3)
    if (slug) rows = rows.filter((row) => row.slug === slug)
    const ids = url.searchParams.get('id')
    if (ids) rows = rows.filter((row) => ids.includes(row.id))
  }
  if (table === 'bookmarks') {
    if (method === 'DELETE') saved = false
    if (method === 'POST') saved = true
    rows =
      saved && method === 'GET'
        ? [{ project_id: baseProject.id, created_at: '2026-10-23T12:00:00Z' }]
        : []
  }
  if (table === 'comments')
    rows = [
      {
        id: 'comment-1',
        project_id: baseProject.id,
        author_id: userId,
        body: 'Useful project!',
        created_at: '2026-10-22T12:00:00Z',
      },
    ]
  if (table === 'sprints')
    rows = [
      {
        id: baseProject.sprint_id,
        slug: 'backend-sprint',
        title: 'Backend Sprint',
        theme: 'Web apps',
        description: 'A backend sprint fixture.',
        status: 'active',
        start_date: '2026-10-01',
        end_date: '2026-10-30',
        montage_url: null,
        projects: [{ count: 1 }],
      },
    ]
  return respond(headers.get('accept')?.includes('vnd.pgrst.object') ? (rows[0] ?? null) : rows)
}

const server = await createServer({
  server: { middlewareMode: true, ws: false },
  appType: 'custom',
  define: {
    'import.meta.env.VITE_SUPABASE_URL': '"http://127.0.0.1:54321"',
    'import.meta.env.VITE_SUPABASE_ANON_KEY': '"test-anon-key"',
  },
})
const api = await server.ssrLoadModule('/src/lib/api/client.ts')
const { supabase } = await server.ssrLoadModule('/src/lib/api/supabase.ts')
const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url')
const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: userId, exp: Math.floor(Date.now() / 1000) + 3600, aud: 'authenticated', role: 'authenticated' })}.test-signature`
const session = await supabase.auth.setSession({
  access_token: token,
  refresh_token: 'test-refresh-token',
})
assert.equal(session.error, null)
beforeEach(() => {
  calls.length = 0
  failTable = null
  saved = true
})
after(async () => {
  await supabase.auth.stopAutoRefresh()
  await server.close()
  globalThis.fetch = originalFetch
})

test('configured backend disables demo login and reset', async () => {
  assert.equal(api.isBackendConfigured, true)
  await assert.rejects(api.signInDemo(), /unavailable/)
  await assert.rejects(api.resetDemoData(), /unavailable/)
})

test('project queries map database rows and public discovery explicitly restricts approval', async () => {
  const feed = await api.listProjects()
  assert.equal(feed.projects.length, 1)
  assert.equal(feed.projects[0].authorName, 'Backend Student')
  assert.equal(feed.projects[0].contributors[0].name, 'A Teammate')
  assert.ok(
    calls.some(
      (call) =>
        call.url.pathname.endsWith('/projects') &&
        call.url.searchParams.get('status') === 'eq.approved',
    ),
  )
  const owned = await api.listMyProjects()
  assert.equal(owned.length, 2)
  assert.ok(
    calls.some(
      (call) =>
        call.url.pathname.endsWith('/projects') &&
        call.url.searchParams.get('author_id') === `eq.${userId}`,
    ),
  )
  assert.equal((await api.getProjectBySlug('backend-private')).status, 'pending')
})

test('bookmarks use the authenticated owner and removal does not toggle a missing save back on', async () => {
  assert.equal((await api.listSavedProjects()).length, 1)
  await api.removeBookmark(baseProject.id)
  await api.removeBookmark(baseProject.id)
  assert.equal((await api.listSavedProjects()).length, 0)
  const deletes = calls.filter((call) => call.method === 'DELETE')
  assert.equal(deletes.length, 2)
  assert.ok(deletes.every((call) => call.url.searchParams.get('user_id') === `eq.${userId}`))
})

test('profile updates send only editable fields and private reads select the current owner', async () => {
  await api.updateMyProfile({
    name: 'Updated Student',
    program: 'Computer Science',
    studyYear: 'Year 2',
    skills: ['React'],
    bio: 'Updated.',
    githubUrl: '',
    role: 'admin',
    email: 'attacker@example.com',
  })
  const patch = calls.find((call) => call.method === 'PATCH')
  assert.ok(patch)
  assert.equal(patch.url.searchParams.get('id'), `eq.${userId}`)
  assert.ok(!('role' in patch.body))
  assert.ok(!('email' in patch.body))
  const publicResult = await api.getPublicProfile(userId)
  assert.ok(!('email' in publicResult))
  assert.ok(!('role' in publicResult))
})

test('missing tables fail instead of returning mock records', async () => {
  failTable = 'projects'
  await assert.rejects(
    api.listProjects(),
    (error) => error.message === 'Database fixture unavailable',
  )
  failTable = 'public_profiles'
  await assert.rejects(api.getPublicProfile(userId), /migration/)
  failTable = 'profiles'
  await assert.rejects(api.getMyProfile(), (error) => Boolean(error.message))
})

test('sprint and comment reads use database rows with normalized domain fields', async () => {
  const sprint = (await api.listMySprints())[0]
  assert.equal(sprint.title, 'Backend Sprint')
  assert.equal(sprint.projectCount, 1)
  const comment = (await api.listComments(baseProject.id))[0]
  assert.equal(comment.projectId, baseProject.id)
  assert.equal(comment.authorName, 'Backend Student')
})

test('configured activity and upvote writes use the authenticated owner', async () => {
  const activity = await api.listMyActivity()
  assert.ok(activity.some((item) => item.kind === 'comment'))
  assert.ok(
    calls.some(
      (call) =>
        call.url.pathname.endsWith('/comments') &&
        call.url.searchParams.get('author_id') === `eq.${userId}`,
    ),
  )
  await api.toggleUpvote(baseProject.id)
  const write = calls.find(
    (call) => call.url.pathname.endsWith('/upvotes') && call.method === 'POST',
  )
  assert.equal(write.body.user_id, userId)
  assert.equal(write.body.project_id, baseProject.id)
})
