// Validation, recovery, privacy, and image constraints shared by registration and profile editing.

import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createServer } from 'vite'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const server = await createServer({
  server: { middlewareMode: true, ws: false },
  appType: 'custom',
  define: {
    'import.meta.env.VITE_SUPABASE_URL': '""',
    'import.meta.env.VITE_SUPABASE_ANON_KEY': '""',
  },
})
const { isAllowedStudentEmail } = await server.ssrLoadModule('/src/lib/auth/domain.ts')
const {
  emptyOnboarding,
  normalizeOnboarding,
  normalizeLink,
  onboardingErrors,
  onboardingPreview,
  resumeOnboardingStep,
} = await server.ssrLoadModule('/src/lib/onboarding.ts')
const { validateProfileImage, cropRectangle } = await server.ssrLoadModule(
  '/src/lib/profileImage.ts',
)
const { ProfileSummary } = await server.ssrLoadModule('/src/components/account/ProfileSummary.tsx')
const { AcademicFields } = await server.ssrLoadModule(
  '/src/components/onboarding/AcademicFields.tsx',
)
const { OtpInput } = await server.ssrLoadModule('/src/components/auth/OtpInput.tsx')
const api = await server.ssrLoadModule('/src/lib/api/client.ts')
after(() => server.close())
const valid = {
  ...emptyOnboarding(),
  firstName: ' Taylor ',
  lastName: ' Chen ',
  program: 'Physics',
  studyYear: 'Graduate',
}
const link = {
  id: 'link-1',
  platform: 'github',
  label: 'GitHub',
  value: 'github.com/taylor',
  isPublic: true,
}

test('university email validation checks syntax and exact permitted domains', () => {
  for (const email of ['name@ontariotechu.net', ' NAME@ONTARIOTECHU.CA '])
    assert.equal(isAllowedStudentEmail(email), true)
  for (const email of [
    '@ontariotechu.net',
    'one@two@ontariotechu.net',
    'name @ontariotechu.net',
    'name@gmail.com',
    'name@ontariotechu.net.evil.test',
    'ontariotechu.ca',
  ])
    assert.equal(isAllowedStudentEmail(email), false, email)
})
test('required academic data validates while every optional step can remain empty', () => {
  assert.deepEqual(onboardingErrors(valid), {})
  assert.equal(normalizeOnboarding(valid).firstName, 'Taylor')
  for (const key of ['firstName', 'lastName', 'program', 'studyYear'])
    assert.ok(onboardingErrors({ ...valid, [key]: '' })[key])
  assert.ok(onboardingErrors({ ...valid, graduationYear: '1999' }).graduationYear)
  assert.ok(onboardingErrors({ ...valid, headline: 'x'.repeat(61) }).headline)
  assert.ok(onboardingErrors({ ...valid, languages: Array(21).fill('Python') }).languages)
})
test('resumption requires academic details and bounds stored step numbers', () => {
  assert.equal(resumeOnboardingStep(7, emptyOnboarding()), 3)
  assert.equal(resumeOnboardingStep(5, valid), 5)
  assert.equal(resumeOnboardingStep(100, valid), 7)
  assert.equal(resumeOnboardingStep(1, valid), 3)
})
test('social links normalize URLs, validate platforms, and keep Discord as a handle', () => {
  assert.equal(normalizeLink(link).value, 'https://github.com/taylor')
  assert.equal(
    normalizeLink({ ...link, platform: 'discord', value: '@taylor.dev' }).value,
    'taylor.dev',
  )
  for (const value of [
    'javascript:alert(1)',
    'data:text/html,test',
    'ftp://github.com/taylor',
    'https://github.com.evil.test/taylor',
    'https://user:pass@github.com/taylor',
    'https://github.com:444/taylor',
    'https://github.com/',
  ])
    assert.throws(() => normalizeLink({ ...link, value }))
  assert.throws(() =>
    normalizeLink({ ...link, platform: 'discord', value: 'https://discord.com/user' }),
  )
  assert.throws(() => normalizeLink({ ...link, platform: 'discord', value: 'bad..name' }))
  assert.equal(
    normalizeLink({
      ...link,
      platform: 'custom',
      label: 'My blog',
      value: 'https://my.example.test/posts',
    }).label,
    'My blog',
  )
})
test('public preview excludes private links, unsafe values, and private account names', () => {
  const preview = onboardingPreview(
    {
      ...valid,
      displayName: 'Public nickname',
      links: [
        link,
        { ...link, id: 'private', value: 'https://github.com/private', isPublic: false },
        { ...link, id: 'unsafe', value: 'javascript:alert(1)' },
      ],
    },
    'user-1',
  )
  assert.equal(preview.name, 'Public nickname')
  assert.deepEqual(
    preview.links.map((item) => item.id),
    ['link-1'],
  )
  const html = renderToStaticMarkup(React.createElement(ProfileSummary, { profile: preview }))
  assert.ok(html.includes('https://github.com/taylor'))
  assert.ok(!html.includes('https://github.com/private'))
  assert.ok(!html.includes('Taylor'))
  assert.ok(html.includes('noopener noreferrer'))
})
test('image validation rejects wrong types and enforces separate avatar/banner limits', () => {
  for (const type of ['image/jpeg', 'image/png', 'image/webp'])
    assert.doesNotThrow(() => validateProfileImage({ type, size: 1024 }, 'avatar'))
  assert.throws(() => validateProfileImage({ type: 'image/svg+xml', size: 1024 }, 'avatar'))
  assert.throws(() => validateProfileImage({ type: 'image/png', size: 6 * 1024 * 1024 }, 'avatar'))
  assert.doesNotThrow(() =>
    validateProfileImage({ type: 'image/png', size: 6 * 1024 * 1024 }, 'banner'),
  )
  assert.throws(() => validateProfileImage({ type: 'image/png', size: 11 * 1024 * 1024 }, 'banner'))
  assert.throws(() => validateProfileImage({ type: 'image/png', size: 0 }, 'banner'))
})
test('crop preview and output use the same bounded square or 3:1 rectangle', () => {
  assert.deepEqual(cropRectangle(1200, 600, 1, 1, 50, 50), {
    x: 300,
    y: 0,
    width: 600,
    height: 600,
  })
  assert.deepEqual(cropRectangle(1200, 600, 3, 2, 100, 100), {
    x: 600,
    y: 400,
    width: 600,
    height: 200,
  })
})
test('unconfigured signup never pretends to send or verify an OTP', async () => {
  await assert.rejects(
    api.sendEmailCode('student@ontariotechu.net', 'register'),
    /configured Supabase/,
  )
  await assert.rejects(
    api.verifyEmailCode('student@ontariotechu.net', '123456'),
    /configured Supabase/,
  )
  await assert.rejects(api.verifyEmailCode('student@ontariotechu.net', '123'), /six-digit/)
})
test('OTP and academic fields expose labels, input modes, and inline error associations', () => {
  const otp = renderToStaticMarkup(React.createElement(OtpInput, { value: '', onChange() {} }))
  assert.equal((otp.match(/inputMode="numeric"/g) ?? []).length, 6)
  assert.ok(otp.includes('one-time-code'))
  assert.ok(otp.includes('Code digit 6'))
  const academic = renderToStaticMarkup(
    React.createElement(AcademicFields, {
      details: emptyOnboarding(),
      onChange() {},
      errors: { firstName: 'Required name' },
    }),
  )
  assert.ok(academic.includes('aria-invalid="true"'))
  assert.ok(academic.includes('Required name'))
  assert.ok(academic.includes('aria-describedby'))
})
