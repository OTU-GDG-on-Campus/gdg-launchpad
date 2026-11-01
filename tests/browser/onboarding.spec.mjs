// Real browser interactions against intercepted Auth, database, and Storage contracts, never hosted accounts.

import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  page.on('pageerror', (error) => {
    throw error
  })
})

const uid = '11111111-1111-4111-8111-111111111111'
const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url')
const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: uid, exp: Math.floor(Date.now() / 1000) + 3600, aud: 'authenticated', role: 'authenticated' })}.test-signature`
const authUser = {
  id: uid,
  email: 'test@ontariotechu.net',
  aud: 'authenticated',
  role: 'authenticated',
  email_confirmed_at: '2026-10-01T00:00:00Z',
  created_at: '2026-10-01T00:00:00Z',
  app_metadata: { provider: 'email' },
  user_metadata: {},
}
const session = {
  access_token: token,
  refresh_token: 'test-refresh',
  token_type: 'bearer',
  expires_in: 3600,
  user: authUser,
}

async function backend(page, registered = false) {
  const state = {
    profile: {
      id: uid,
      email: authUser.email,
      name: 'Taylor Chen',
      first_name: 'Taylor',
      last_name: 'Chen',
      avatar_url: null,
      headline: '',
      role: 'student',
      banned_at: null,
      registered_at: registered ? '2026-10-01T00:00:00Z' : null,
      program: registered ? 'Computer Science' : null,
      study_year: registered ? 'Year 2' : null,
      skills: [],
      bio: '',
      github_url: null,
      languages: [],
      frameworks: [],
      tools: [],
      interests: [],
      preferred_roles: [],
      collaboration: [],
      avatar_path: null,
      banner_path: null,
      introduction: '',
      graduation_year: null,
    },
    draft: null,
    links: [],
    calls: [],
    failPublish: false,
    failUpload: false,
    failDraft: false,
  }
  await page.route('http://127.0.0.1:54329/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    let body = null
    try {
      body = request.postDataJSON()
    } catch {
      /* Storage uploads carry multipart data. */
    }
    state.calls.push({ path: url.pathname, body, method: request.method() })
    const respond = (data, status = 200) =>
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) })
    if (url.pathname === '/auth/v1/otp') return respond({})
    if (url.pathname === '/auth/v1/verify')
      return body.token === '123456'
        ? respond(session)
        : respond({ code: 'otp_expired', msg: 'Token has expired or is invalid' }, 403)
    if (url.pathname === '/auth/v1/user') return respond(authUser)
    if (url.pathname === '/auth/v1/token') return respond(session)
    if (url.pathname === '/auth/v1/logout') return respond({})
    if (url.pathname.includes('/object/upload/sign/')) {
      if (request.method() === 'POST')
        return respond({ url: url.pathname.replace('/storage/v1', '') + '?token=upload-test' })
      return state.failUpload
        ? respond({ message: 'Upload failed' }, 500)
        : respond({ Key: url.pathname })
    }
    if (url.pathname.includes('/object/sign/')) {
      if (request.method() === 'POST')
        return respond({ signedURL: url.pathname.replace('/storage/v1', '') + '?token=read-test' })
      return route.fulfill({
        contentType: 'image/png',
        body: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',
          'base64',
        ),
      })
    }
    if (url.pathname.includes('/object/list/')) return respond([])
    if (url.pathname.includes('/storage/v1/object/')) return respond([])
    const table = url.pathname.split('/').at(-1)
    if (table === 'save_onboarding_draft') {
      if (state.failDraft) return respond({ message: 'Connection unavailable', code: 'P0001' }, 400)
      if ((state.draft?.revision ?? 0) !== body.p_revision)
        return respond(
          { message: 'Your draft changed in another tab. Reload before editing.', code: 'P0001' },
          400,
        )
      state.draft = { details: body.p_details, step: body.p_step, revision: body.p_revision + 1 }
      return respond(state.draft.revision)
    }
    if (table === 'publish_developer_profile') {
      if (state.failPublish) return respond({ message: 'Transaction failed', code: 'P0001' }, 400)
      const details = body.p_details
      Object.assign(state.profile, {
        name: details.displayName || `${details.firstName} ${details.lastName}`,
        first_name: details.firstName,
        last_name: details.lastName,
        program: details.program,
        study_year: details.studyYear,
        bio: details.bio,
        headline: details.headline,
        introduction: details.introduction,
        skills: details.skills,
        languages: details.languages,
        frameworks: details.frameworks,
        tools: details.tools,
        interests: details.interests,
        preferred_roles: details.roles,
        collaboration: details.collaboration,
        graduation_year: details.graduationYear ? +details.graduationYear : null,
        avatar_path: details.avatarPath,
        banner_path: details.bannerPath,
        registered_at: state.profile.registered_at || new Date().toISOString(),
      })
      state.links = details.links.map((link) => ({ ...link, is_public: link.isPublic }))
      state.draft = null
      return respond(null)
    }
    if (table === 'profiles') return respond(state.profile)
    if (table === 'public_profiles')
      return respond(state.profile.registered_at ? [state.profile] : [])
    if (table === 'onboarding_drafts') return respond(state.draft)
    if (table === 'profile_links')
      return respond(
        url.searchParams.get('is_public') === 'eq.true'
          ? state.links.filter((link) => link.is_public)
          : state.links,
      )
    return respond([])
  })
  return state
}

async function verify(page, mode = 'register') {
  await page.goto('/' + mode)
  await page.getByLabel('Ontario Tech email').fill(authUser.email)
  await page.getByRole('button', { name: 'Send verification code', exact: true }).click()
  await page.getByLabel('Code digit 1', { exact: true }).fill('123456')
  await page
    .getByRole('button', {
      name: mode === 'register' ? 'Verify & continue' : 'Verify & sign in',
      exact: true,
    })
    .click()
  if (mode === 'login') await expect(page).toHaveURL(/\/me\/projects/)
  else await expect(page.getByRole('heading', { name: 'About you', exact: true })).toBeVisible()
}

async function academic(page) {
  await page.getByLabel('First name', { exact: true }).fill('Taylor')
  await page.getByLabel('Last name', { exact: true }).fill('Chen')
  await page.getByLabel('Academic program', { exact: true }).selectOption('Computer Science')
  await page.getByLabel('Current year of study', { exact: true }).selectOption('Year 2')
  await page.getByRole('button', { name: 'Continue →', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Developer identity', exact: true })).toBeVisible()
}

test('OTP validation, cooldown, paste, focus, email changes, and login never creates accounts', async ({
  page,
}) => {
  const state = await backend(page)
  await page.goto('/login')
  await page.getByLabel('Ontario Tech email').fill('no@example.com')
  await page.getByRole('button', { name: 'Send verification code', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('university email')
  await page.getByLabel('Ontario Tech email').fill(authUser.email)
  await page.getByRole('button', { name: 'Send verification code', exact: true }).click()
  await expect(page.getByRole('button', { name: /Resend in/ })).toBeDisabled()
  expect(state.calls.find((call) => call.path === '/auth/v1/otp').body.create_user).toBe(false)
  await page.getByLabel('Code digit 1', { exact: true }).fill('1')
  await expect(page.getByLabel('Code digit 2', { exact: true })).toBeFocused()
  await page.getByLabel('Code digit 1', { exact: true }).fill('000000')
  await page.getByRole('button', { name: 'Verify & sign in', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('wrong or has expired')
  await page.getByLabel('Code digit 1', { exact: true }).evaluate((input) => {
    const data = new DataTransfer()
    data.setData('text/plain', '123456')
    input.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true }))
  })
  await expect(page.getByLabel('Code digit 6', { exact: true })).toHaveValue('6')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Check your inbox' })).toBeVisible()
  await page.getByRole('button', { name: 'Change email' }).click()
  await expect(page.getByLabel('Ontario Tech email')).toHaveValue(authUser.email)
})

for (const theme of ['dark', 'light']) {
  test(`seven steps, refresh recovery, optional skips, failed completion, and privacy in ${theme}`, async ({
    page,
  }) => {
    const state = await backend(page)
    await page.setViewportSize(
      theme === 'dark' ? { width: 1280, height: 900 } : { width: 390, height: 844 },
    )
    await page.addInitScript((value) => localStorage.setItem('launchpad-theme', value), theme)
    await verify(page)
    await expect(page.getByRole('heading', { name: 'About you', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Continue →', exact: true }).click()
    await expect(page.getByText('Check the highlighted fields')).toBeVisible()
    await academic(page)
    await page.getByLabel('Professional headline').fill('Building together')
    await page.getByRole('button', { name: 'Python', exact: true }).click()
    await page.getByRole('button', { name: 'Continue →', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Profile images', exact: true })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Profile images', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Skip for now', exact: true }).click()
    await page.getByRole('button', { name: '+ Add link', exact: true }).click()
    await page.getByLabel('Profile URL', { exact: true }).fill('github.com/taylor')
    await page.getByLabel('Add a platform', { exact: true }).selectOption('custom')
    await page.getByRole('button', { name: '+ Add link', exact: true }).click()
    await page.getByLabel('Website label').fill('Private portfolio')
    await page
      .getByLabel('Profile URL', { exact: true })
      .nth(1)
      .fill('https://private.example.test')
    await page.getByLabel('Show on my public profile').nth(1).uncheck()
    await page.getByRole('button', { name: 'Continue →', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Review & finish', exact: true })).toBeVisible()
    await expect(page.getByText('Private links (only you can see these)')).toBeVisible()
    await page.screenshot({ path: `test-results/onboarding-review-${theme}.png`, fullPage: true })
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
    state.failPublish = true
    await page.getByRole('button', { name: 'Complete Registration', exact: true }).click()
    await expect(page.getByRole('alert')).toContainText('could not be saved')
    expect(state.profile.registered_at).toBeNull()
    state.failPublish = false
    await page.getByRole('button', { name: 'Complete Registration', exact: true }).click()
    await expect(page.getByText('You’re in. Let’s build something.')).toBeVisible()
    await expect(page).toHaveURL(/\/me\/projects/)
    await page.goto('/u/' + uid)
    await expect(page.getByRole('link', { name: 'GitHub (opens in a new tab)' })).toBeVisible()
    await expect(page.getByText('Private portfolio')).toHaveCount(0)
    await expect(page.getByText(authUser.email)).toHaveCount(0)
    await page.goto('/register')
    await expect(page).toHaveURL(/\/me\/projects/)
  })
}

test('incomplete accounts redirect, profile drafts retain values, and upload failure can recover', async ({
  page,
}) => {
  const state = await backend(page)
  await verify(page)
  await page.goto('/me/settings')
  await expect(page).toHaveURL(/\/register/)
  await academic(page)
  await page.getByRole('button', { name: 'Skip for now', exact: true }).click()
  const png = await page.evaluate(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 100
    canvas.getContext('2d').fillRect(0, 0, 100, 100)
    return canvas.toDataURL('image/png').split(',')[1]
  })
  const image = { name: 'avatar.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') }
  await page
    .getByLabel('Choose an image', { exact: true })
    .first()
    .setInputFiles({ name: 'bad.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') })
  await expect(page.getByRole('alert')).toContainText('JPG, PNG, or WebP')
  await page.getByLabel('Choose an image', { exact: true }).first().setInputFiles(image)
  state.failUpload = true
  await page.getByRole('button', { name: 'Crop & upload', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('upload failed')
  state.failUpload = false
  await page.getByRole('button', { name: 'Crop & upload', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Remove image', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Continue →', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Your links', exact: true })).toBeVisible()
  expect(state.draft.details.avatarPath).toMatch(new RegExp('^' + uid + '/'))
  const avatarPath = state.draft.details.avatarPath
  await page.getByRole('button', { name: 'Skip for now', exact: true }).click()
  await page.getByRole('button', { name: 'Complete Registration', exact: true }).click()
  await expect(page).toHaveURL(/\/me\/projects/)
  expect(state.profile.avatar_path).toBe(avatarPath)
  await page.goto('/me/settings/profile')
  await expect(page.getByLabel('First name', { exact: true })).toHaveValue('Taylor')
  await page.getByRole('button', { name: '4. Your links', exact: true }).click()
  await page.getByLabel('Add a platform', { exact: true }).selectOption('discord')
  await page.getByRole('button', { name: '+ Add link', exact: true }).click()
  await page.getByLabel('Discord username', { exact: true }).fill('taylor.dev')
  await page.getByRole('button', { name: 'Continue →', exact: true }).click()
  await page.getByRole('button', { name: 'Save profile', exact: true }).click()
  await expect(page.getByText('Profile saved. Your public page is up to date.')).toBeVisible()
  expect(state.links.some((link) => link.platform === 'discord')).toBe(true)
})

test('existing members log in directly and form navigation supports keyboard and reduced motion', async ({
  page,
}) => {
  await backend(page, true)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await verify(page, 'login')
  await expect(page).toHaveURL(/\/me\/projects/)
  await page.goto('/me/settings/profile')
  await expect(page.getByRole('heading', { name: 'About you', exact: true })).toBeFocused()
  await page.getByRole('button', { name: 'Continue →', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: 'Developer identity', exact: true })).toBeFocused()
  await page.getByRole('button', { name: 'Python', exact: true }).focus()
  await page.keyboard.press('Space')
  await expect(page.getByRole('button', { name: 'Python', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.getByRole('button', { name: '← Back', exact: true }).click()
  await expect(page.getByLabel('First name', { exact: true })).toHaveValue('Taylor')
})

test('failed draft saves retry without losing input and expired sessions restore server progress', async ({
  page,
}) => {
  const state = await backend(page)
  await verify(page)
  await academic(page)
  state.failDraft = true
  await page.getByLabel('Professional headline').fill('Keep this draft')
  await expect(page.getByRole('button', { name: 'Retry save', exact: true })).toBeVisible()
  await expect(page.getByLabel('Professional headline')).toHaveValue('Keep this draft')
  state.failDraft = false
  await page.getByRole('button', { name: 'Retry save', exact: true }).click()
  await expect(page.getByText('All changes saved privately', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Continue →', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Profile images', exact: true })).toBeVisible()
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await expect(page.getByLabel('Ontario Tech email')).toBeVisible()
  await page.getByLabel('Ontario Tech email').fill(authUser.email)
  await page.getByRole('button', { name: 'Send verification code', exact: true }).click()
  await page.getByLabel('Code digit 1', { exact: true }).fill('123456')
  await page.getByRole('button', { name: 'Verify & continue', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Profile images', exact: true })).toBeVisible()
  await page.getByRole('button', { name: '← Back', exact: true }).click()
  await expect(page.getByLabel('Professional headline')).toHaveValue('Keep this draft')
  state.draft.revision += 1
  await page.getByLabel('Professional headline').fill('A conflicting update')
  await expect(page.getByRole('alert')).toContainText('another tab')
  await page.reload()
  await expect(page.getByLabel('Professional headline')).toHaveValue('Keep this draft')
})
