// Account API and route-guard regression tests using Vite transforms and Node's built-in runner.

import assert from 'node:assert/strict'
import { after, beforeEach, test } from 'node:test'
import { createServer } from 'vite'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'

const storage = new Map()
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear(),
}
const server = await createServer({
  server: { middlewareMode: true, ws: false },
  appType: 'custom',
  define: {
    'import.meta.env.VITE_SUPABASE_URL': '""',
    'import.meta.env.VITE_SUPABASE_ANON_KEY': '""',
  },
})
const api = await server.ssrLoadModule('/src/lib/api/client.ts')
const { normalizeProfile } = await server.ssrLoadModule('/src/lib/profile.ts')
const { AuthContext } = await server.ssrLoadModule('/src/lib/auth/auth-context.ts')
const { RequireAuth } = await server.ssrLoadModule('/src/components/auth/RequireAuth.tsx')
const { ProfileSummary } = await server.ssrLoadModule('/src/components/account/ProfileSummary.tsx')
const { NotificationsPage } = await server.ssrLoadModule('/src/pages/NotificationsPage.tsx')

after(async () => {
  await server.close()
})
beforeEach(async () => {
  await api.resetDemoData()
  await api.signOutUser()
})

function guard(value, adminOnly = false) {
  return renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      {},
      React.createElement(
        AuthContext.Provider,
        { value },
        React.createElement(
          RequireAuth,
          { adminOnly },
          React.createElement('p', {}, 'Private content'),
        ),
      ),
    ),
  )
}

const details = {
  name: 'Taylor Chen',
  program: 'Computer Science',
  studyYear: 'Year 3',
  skills: ['React', ' TypeScript ', 'React'],
  bio: 'Learning by building.',
  githubUrl: 'https://github.com/taylor/',
}

test('signed-out visitors cannot load personal data or write', async () => {
  assert.equal(await api.getCurrentUser(), null)
  await assert.rejects(api.listMyProjects(), /Sign in/)
  await assert.rejects(api.getMyProfile(), /Sign in/)
  await assert.rejects(api.toggleBookmark('project-ridgeback-scheduler'), /Sign in/)
  await assert.rejects(api.toggleUpvote('project-ridgeback-scheduler'), /Sign in/)
  assert.deepEqual(await api.listBookmarkedIds(), [])
})

test('one-click demo login restores a complete student and persists the session', async () => {
  const user = await api.signInDemo()
  assert.equal(user.role, 'student')
  assert.ok(user.registeredAt)
  assert.equal((await api.getCurrentUser()).name, 'Alex Morgan')
  assert.equal(JSON.parse(storage.get('launchpad-demo-v1')).signedIn, true)
})

test('owned-project statuses stay out of public discovery and signed-out detail reads', async () => {
  const user = await api.signInDemo()
  const owned = await api.listMyProjects()
  assert.ok(owned.every((project) => project.authorId === user.id))
  assert.deepEqual(
    new Set(owned.map((project) => project.status)),
    new Set(['approved', 'pending', 'rejected']),
  )
  const pending = owned.find((project) => project.status === 'pending')
  assert.ok(await api.getProjectBySlug(pending.slug))
  assert.ok(
    (await api.listProjects({ perPage: 100 })).projects.every(
      (project) => project.status === 'approved',
    ),
  )
  await api.signOutUser()
  assert.equal(await api.getProjectBySlug(pending.slug), null)
})

test('saved-project removal is persistent and idempotent', async () => {
  await api.signInDemo()
  const initial = await api.listSavedProjects()
  assert.equal(initial.length, 3)
  await api.removeBookmark(initial[0].id)
  await api.removeBookmark(initial[0].id)
  assert.equal((await api.listSavedProjects()).length, 2)
  assert.equal(await api.toggleBookmark(initial[0].id), true)
  assert.equal((await api.listSavedProjects())[0].id, initial[0].id)
})

test('public profiles expose exactly the public fields, without email or account flags', async () => {
  const user = await api.signInDemo()
  const profile = await api.getPublicProfile(user.id)
  assert.deepEqual(
    Object.keys(profile).sort(),
    ['avatarUrl', 'bio', 'githubUrl', 'id', 'name', 'program', 'skills', 'studyYear'].sort(),
  )
  const projects = await api.listPublicProfileProjects(user.id)
  assert.ok(projects.length)
  assert.ok(
    projects.every((project) => project.status === 'approved' && project.authorId === user.id),
  )
  await api.signOutUser()
  assert.ok(await api.getPublicProfile(user.id))
  assert.equal(await api.getPublicProfile('unknown-user'), null)
})

test('profile edits persist and update the signed-in identity without changing privileges', async () => {
  await api.signInDemo()
  const profile = await api.updateMyProfile({
    ...details,
    email: 'attacker@example.com',
    role: 'admin',
  })
  assert.equal(profile.name, details.name)
  assert.deepEqual(profile.skills, ['React', 'TypeScript'])
  assert.equal(profile.githubUrl, 'https://github.com/taylor')
  assert.equal((await api.getCurrentUser()).role, 'student')
  assert.equal((await api.getCurrentUser()).name, details.name)
  assert.equal((await api.getMyProfile()).email, 'demo.student@ontariotechu.net')
})

test('profile validation rejects invalid names, unsupported years, excessive skills, and unsafe URLs', () => {
  for (const change of [
    { name: ' ' },
    { name: 'x'.repeat(81) },
    { studyYear: 'Year 9' },
    { program: '' },
    { skills: Array.from({ length: 21 }, (_, index) => `Skill ${index}`) },
    { skills: ['x'.repeat(41)] },
    { bio: 'x'.repeat(501) },
    { githubUrl: 'javascript:alert(1)' },
    { githubUrl: 'https://github.com:444/user' },
    { githubUrl: 'https://github.com.evil.test/user' },
    { githubUrl: 'https://github.com/user/repo' },
    { githubUrl: 'https://github.com/user?token=secret' },
  ]) {
    assert.throws(() => normalizeProfile({ ...details, ...change }))
  }
})

test('upvotes toggle once per user and pending projects cannot be voted on', async () => {
  await api.signInDemo()
  const project = (await api.listProjects()).projects[0]
  const first = await api.toggleUpvote(project.id)
  const second = await api.toggleUpvote(project.id)
  assert.equal(first.viewerHasUpvoted, !project.viewerHasUpvoted)
  assert.equal(second.viewerHasUpvoted, project.viewerHasUpvoted)
  assert.equal(second.upvoteCount, project.upvoteCount)
  await assert.rejects(api.toggleUpvote('demo-project-pending'), /unavailable/)
})

test('sprints come from owned projects and activity contains real demo records of every kind', async () => {
  await api.signInDemo()
  const projects = await api.listMyProjects()
  const sprints = await api.listMySprints()
  assert.ok(sprints.length)
  assert.ok(sprints.every((sprint) => projects.some((project) => project.sprintId === sprint.id)))
  const activity = await api.listMyActivity()
  assert.deepEqual(
    new Set(activity.map((item) => item.kind)),
    new Set(['project', 'bookmark', 'upvote', 'comment']),
  )
  assert.deepEqual(
    activity.map((item) => item.createdAt),
    [...activity.map((item) => item.createdAt)].sort().reverse(),
  )
})

test('reset restores demo data and sign-out ends access without deleting samples', async () => {
  await api.signInDemo()
  await api.updateMyProfile(details)
  await api.resetDemoData()
  assert.equal((await api.getCurrentUser()).name, 'Alex Morgan')
  assert.equal((await api.listSavedProjects()).length, 3)
  await api.signOutUser()
  assert.equal(await api.getCurrentUser(), null)
  await assert.rejects(api.listMyActivity(), /Sign in/)
})

test('unfinished registration stays blocked until profile completion', async () => {
  await api.verifyEmailCode('new@ontariotechu.net', '123456')
  const user = api.startDemoRegistration('new@ontariotechu.net')
  assert.equal(user.registeredAt, null)
  await assert.rejects(api.listMyProjects(), /Sign in/)
  await api.saveRegistration(user, details)
  assert.ok((await api.getCurrentUser()).registeredAt)
})

test('route guards distinguish signed-out, unfinished, banned, student, and admin accounts', () => {
  assert.match(guard({ status: 'signed-out', user: null, canParticipate: false }), /Students only/)
  assert.match(
    guard({ status: 'signed-in', user: { registeredAt: null }, canParticipate: false }),
    /Finish creating/,
  )
  assert.match(
    guard({ status: 'signed-in', user: { bannedAt: '2026-10-20' }, canParticipate: false }),
    /Account unavailable/,
  )
  assert.match(
    guard({ status: 'signed-in', user: {}, canParticipate: true, isAdmin: false }),
    /Private content/,
  )
  assert.match(
    guard({ status: 'signed-in', user: {}, canParticipate: true, isAdmin: false }, true),
    /Admins only/,
  )
  assert.match(
    guard({ status: 'signed-in', user: {}, canParticipate: true, isAdmin: true }, true),
    /Private content/,
  )
})

test('public profile presentation and notification placeholder do not invent private or live data', async () => {
  await api.signInDemo()
  const profile = await api.getMyProfile()
  const html = renderToStaticMarkup(React.createElement(ProfileSummary, { profile }))
  assert.ok(!html.includes(profile.email))
  const notifications = renderToStaticMarkup(
    React.createElement(MemoryRouter, {}, React.createElement(NotificationsPage)),
  )
  assert.match(notifications, /not connected yet/)
  assert.ok(!notifications.includes('Mark all as read'))
})

test('malformed browser storage cannot break the demo account loader', async () => {
  for (const raw of [
    '{broken json',
    JSON.stringify({ user: null, profile: null, saved: {}, votes: {}, signedIn: true }),
  ]) {
    storage.set('launchpad-demo-v1', raw)
    assert.equal(await api.getCurrentUser(), null)
    assert.ok((await api.listProjects()).projects.length)
  }
})
