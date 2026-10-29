// Opt-in integration test for local Auth, Mailpit OTP, database persistence, and real private Storage.

import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { createServer } from 'vite'

const raw = execFileSync(
  process.execPath,
  ['node_modules/supabase/dist/supabase.js', 'status', '-o', 'json'],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
)
const config = JSON.parse(raw.slice(raw.indexOf('{')))
assert.equal(
  config.API_URL,
  'http://127.0.0.1:54321',
  'This test must never run against a hosted project',
)
assert.equal(config.MAILPIT_URL, 'http://127.0.0.1:54324')
const server = await createServer({
  server: { middlewareMode: true, ws: false },
  appType: 'custom',
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(config.API_URL),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(config.ANON_KEY),
  },
})
const api = await server.ssrLoadModule('/src/lib/api/client.ts')
const { supabase } = await server.ssrLoadModule('/src/lib/supabase/client.ts')
const { emptyOnboarding } = await server.ssrLoadModule('/src/lib/onboarding.ts')
const visitor = createClient(config.API_URL, config.ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const email = `onboarding-test-${Date.now()}@ontariotechu.net`

try {
  await api.sendEmailCode(email, 'register')
  let code
  for (let attempt = 0; attempt < 25 && !code; attempt++) {
    const inbox = await fetch(
      config.MAILPIT_URL + '/api/v1/search?query=' + encodeURIComponent('to:' + email),
    ).then((response) => response.json())
    if (inbox.messages?.[0]) {
      const message = await fetch(
        config.MAILPIT_URL + '/api/v1/message/' + inbox.messages[0].ID,
      ).then((response) => response.json())
      code = (message.Text || message.HTML).match(/\b\d{6}\b/)?.[0]
    }
    if (!code) await new Promise((resolve) => setTimeout(resolve, 400))
  }
  assert.ok(code, 'Mailpit should receive the six-digit code')
  await assert.rejects(
    api.verifyEmailCode(email, code === '000000' ? '111111' : '000000'),
    /wrong or has expired/,
  )
  await api.verifyEmailCode(email, code)
  const user = await api.getCurrentUser()
  assert.ok(user)
  assert.equal(user.registeredAt, null)
  assert.equal(user.role, 'student')
  const details = {
    ...emptyOnboarding(),
    firstName: 'Local',
    lastName: 'Builder',
    displayName: 'Local public builder',
    program: 'Physics',
    studyYear: 'Graduate',
    languages: ['Python'],
    links: [
      {
        id: crypto.randomUUID(),
        platform: 'github',
        label: 'GitHub',
        value: 'github.com/local-builder',
        isPublic: true,
      },
      {
        id: crypto.randomUUID(),
        platform: 'custom',
        label: 'Private',
        value: 'https://private.example.test',
        isPublic: false,
      },
    ],
  }
  const revision = await api.saveOnboardingDraft(details, 5, 0)
  assert.equal((await api.loadOnboardingDraft()).step, 5)
  assert.equal(
    (await visitor.from('public_profiles').select('id').eq('id', user.id)).data.length,
    0,
  )
  assert.ok((await visitor.from('onboarding_drafts').select('*')).error)

  const path = `${user.id}/${crypto.randomUUID()}.png`
  const image = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64',
  )
  const bucket = supabase.storage.from('profile-avatars')
  assert.equal((await bucket.upload(path, image, { contentType: 'image/png' })).error, null)
  assert.ok((await visitor.storage.from('profile-avatars').createSignedUrl(path, 60)).error)
  assert.ok(
    (await bucket.upload(`${user.id}/bad.svg`, '<svg/>', { contentType: 'image/svg+xml' })).error,
  )
  details.avatarPath = path
  await api.publishDeveloperProfile(details, revision)
  assert.ok((await api.getCurrentUser()).registeredAt)
  const ownerProfile = await api.getMyProfile()
  assert.equal(ownerProfile.links.length, 2)
  const publicProfile = await api.getPublicProfile(user.id)
  assert.equal(publicProfile.links.length, 1)
  assert.ok(!('email' in publicProfile))
  assert.ok(!('firstName' in publicProfile.developer))
  assert.equal(
    (await visitor.storage.from('profile-avatars').createSignedUrl(path, 60)).error,
    null,
  )
  await bucket.remove([path])
  assert.equal(
    (await visitor.storage.from('profile-avatars').createSignedUrl(path, 60)).error,
    null,
    'published image cannot be deleted while attached',
  )
  assert.equal((await visitor.from('profiles').select('*').eq('id', user.id)).data.length, 0)
  assert.equal(
    (await visitor.from('profile_links').select('*').eq('user_id', user.id)).data.length,
    1,
  )
  const completeAt = (await api.getCurrentUser()).registeredAt
  await api.publishDeveloperProfile(
    { ...details, headline: 'Updated headline', avatarPath: null },
    0,
  )
  assert.equal((await api.getCurrentUser()).registeredAt, completeAt)
  await api.removeProfileMedia('avatar', path)
  assert.equal((await bucket.list(user.id)).data.length, 0)
  await api.signOutUser()
  assert.equal(await api.getCurrentUser(), null)
  console.log(
    'PASS: local Mailpit OTP, private drafts, atomic completion, profile editing, public privacy, Storage ownership, MIME restrictions, and sign-out',
  )
} finally {
  await supabase.auth.stopAutoRefresh()
  await server.close()
}
