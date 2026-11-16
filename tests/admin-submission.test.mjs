// Project submission and moderation guard tests, using Vite transforms and Node's built-in runner.

import assert from 'node:assert/strict'
import { after, beforeEach, test } from 'node:test'
import { createServer } from 'vite'

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
const submission = await server.ssrLoadModule('/src/lib/projects/submission.ts')

const valid = {
  title: 'Campus Compass',
  summary: 'A guide to study spaces around campus.',
  description: '',
  category: 'Web App',
  tags: 'React, Supabase',
  repoUrl: 'https://github.com/example/compass',
  liveUrl: '',
  openToContributions: true,
}

beforeEach(() => storage.clear())
after(async () => {
  await server.close()
})

test('a complete submission validates and is trimmed', () => {
  const result = submission.validateSubmission({ ...valid, title: '  Campus Compass  ' })
  assert.equal(result.ok, true)
  assert.equal(result.value.title, 'Campus Compass')
  assert.deepEqual(result.value.tags, ['React', 'Supabase'])
  assert.equal(result.value.liveUrl, null)
})

test('limits mirror the database constraints', () => {
  const result = submission.validateSubmission({
    ...valid,
    title: 'ab',
    summary: 'too short',
    category: '',
  })
  assert.equal(result.ok, false)
  assert.ok(result.errors.title)
  assert.ok(result.errors.summary)
  assert.ok(result.errors.category)
  assert.equal(
    submission.validateSubmission({ ...valid, title: 'x'.repeat(81) }).ok,
    false,
    'titles over 80 characters are refused',
  )
  assert.equal(
    submission.validateSubmission({ ...valid, summary: 'x'.repeat(161) }).ok,
    false,
    'summaries over 160 characters are refused',
  )
})

test('links must be http or https', () => {
  assert.ok(submission.validateSubmission({ ...valid, repoUrl: 'not a link' }).errors.repoUrl)
  assert.ok(
    submission.validateSubmission({ ...valid, liveUrl: 'javascript:alert(1)' }).errors.liveUrl,
  )
  assert.equal(submission.validateSubmission({ ...valid, liveUrl: 'https://example.com' }).ok, true)
})

test('tags are deduplicated, capped, and length checked', () => {
  assert.deepEqual(submission.parseTags('React, react,  Python ,, SQL'), ['React', 'Python', 'SQL'])
  const many = Array.from({ length: 9 }, (_, index) => `tag${index}`).join(',')
  assert.ok(submission.validateSubmission({ ...valid, tags: many }).errors.tags)
  assert.ok(submission.validateSubmission({ ...valid, tags: 'x'.repeat(31) }).errors.tags)
})

test('slugs are url safe and keep same-titled projects apart', () => {
  assert.equal(submission.slugifyTitle('Campus Compass!', 'abc12'), 'campus-compass-abc12')
  assert.equal(submission.slugifyTitle('Café Étude', 'zz999'), 'cafe-etude-zz999')
  assert.equal(submission.slugifyTitle('!!!', 'q1w2e'), 'project-q1w2e')
  assert.match(submission.slugifyTitle('Same title'), /^same-title-[a-z0-9]{5}$/)
  assert.notEqual(submission.slugifyTitle('Same title'), submission.slugifyTitle('Same title'))
})

test('a demo submission is saved as pending and is not public', async () => {
  await api.signInDemo()
  const result = submission.validateSubmission(valid)
  const project = await api.submitProject(result.value)
  assert.equal(project.status, 'pending')
  assert.equal(project.authorName, 'Alex Morgan')

  const mine = await api.listMyProjects()
  assert.ok(mine.some((item) => item.id === project.id && item.status === 'pending'))

  const feed = await api.listProjects({ perPage: 100 })
  assert.ok(!feed.projects.some((item) => item.id === project.id), 'pending stays off the feed')
})

test('only coordinators can use the moderation functions', async () => {
  await api.signInDemo()
  await assert.rejects(() => api.listPendingProjects(), /Coordinator access is required/)
  await assert.rejects(() => api.reviewProject('x', 'approved'), /Coordinator access is required/)
  await assert.rejects(() => api.listRecentComments(), /Coordinator access is required/)
  await assert.rejects(() => api.deleteComment('x'), /Coordinator access is required/)
})
