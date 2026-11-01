// Shared normalization and field validation for private drafts, onboarding, and profile editing.

import { COLLABORATION_OPTIONS, LINK_PLATFORMS } from '@/config/onboarding'
import { STUDY_YEARS } from '@/lib/profile'
import type {
  AccountProfile,
  DeveloperProfile,
  OnboardingDetails,
  ProfileLink,
  PublicProfile,
} from '@/types'

export function emptyOnboarding(): OnboardingDetails {
  return {
    firstName: '',
    lastName: '',
    displayName: '',
    program: '',
    studyYear: '',
    graduationYear: '',
    introduction: '',
    headline: '',
    bio: '',
    skills: [],
    languages: [],
    frameworks: [],
    tools: [],
    interests: [],
    roles: [],
    collaboration: [],
    avatarPath: null,
    bannerPath: null,
    avatarUrl: null,
    bannerUrl: null,
    links: [],
  }
}

export function profileToOnboarding(profile: AccountProfile): OnboardingDetails {
  if (profile.onboarding) return profile.onboarding
  const [firstName, ...rest] = profile.name.split(' ')
  return {
    ...emptyOnboarding(),
    ...profile.developer,
    firstName,
    lastName: rest.join(' '),
    displayName: profile.name,
    program: profile.program,
    studyYear: profile.studyYear,
    bio: profile.bio,
    skills: profile.skills,
    avatarUrl: profile.avatarUrl,
    links:
      profile.links ??
      (profile.githubUrl
        ? [
            {
              id: crypto.randomUUID(),
              platform: 'github',
              label: 'GitHub',
              value: profile.githubUrl,
              isPublic: true,
            },
          ]
        : []),
  }
}

export function normalizeLink(link: ProfileLink): ProfileLink {
  const platform = LINK_PLATFORMS.find((item) => item.id === link.platform)
  if (!platform) throw new Error('Choose a supported platform.')
  const label = link.label.trim() || platform.label
  if (label.length > 60) throw new Error('Link labels must be 60 characters or fewer.')
  let value = link.value.trim()
  if (!value || value.length > 2048) throw new Error('Enter a profile URL or remove this link.')
  if (platform.id === 'discord') {
    value = value.replace(/^@/, '')
    if (!/^[a-z0-9_.]{2,32}$/.test(value) || value.includes('..'))
      throw new Error(
        'Use a Discord username: 2-32 lowercase letters, numbers, dots or underscores.',
      )
  } else {
    if (/^[a-z][a-z\d+.-]*:/i.test(value) && !/^https?:\/\//i.test(value))
      throw new Error('Only HTTP and HTTPS links are allowed.')
    if (!/^https?:\/\//i.test(value)) value = `https://${value}`
    let url: URL
    try {
      url = new URL(value)
    } catch {
      throw new Error('Enter a valid profile URL.')
    }
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.port ||
      !url.hostname.includes('.') ||
      /[\s\\]/.test(value)
    )
      throw new Error('Use a public HTTP or HTTPS URL without credentials or a custom port.')
    const host = url.hostname.toLowerCase().replace(/^www\./, '')
    if (platform.hosts.length && !platform.hosts.includes(host))
      throw new Error(`Use a ${platform.label} profile URL.`)
    if (platform.hosts.length && url.pathname === '/')
      throw new Error('Include your profile path in the URL.')
    value = url.href.replace(/\/$/, '')
  }
  return { ...link, label, value }
}

export function onboardingErrors(
  details: OnboardingDetails,
  step?: number,
): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!step || step === 3 || step === 7) {
    for (const key of ['firstName', 'lastName'] as const)
      if (!details[key].trim() || details[key].trim().length > 40)
        errors[key] = 'Enter 1-40 characters.'
    if (!details.program.trim() || details.program.trim().length > 80)
      errors.program = 'Enter your academic program (up to 80 characters).'
    if (!STUDY_YEARS.includes(details.studyYear))
      errors.studyYear = 'Choose your current year of study.'
    if (details.displayName.trim().length > 80) errors.displayName = 'Use up to 80 characters.'
    if (
      details.graduationYear &&
      (!/^\d{4}$/.test(details.graduationYear) ||
        +details.graduationYear < 2000 ||
        +details.graduationYear > 2100)
    )
      errors.graduationYear = 'Enter a year from 2000 to 2100.'
    if (details.introduction.length > 280) errors.introduction = 'Use up to 280 characters.'
  }
  if (!step || step === 4 || step === 7) {
    if (details.headline.length > 60) errors.headline = 'Use up to 60 characters.'
    if (details.bio.length > 500) errors.bio = 'Use up to 500 characters.'
    for (const key of [
      'skills',
      'languages',
      'frameworks',
      'tools',
      'interests',
      'roles',
    ] as const) {
      if (
        details[key].length > 20 ||
        details[key].some((item) => !item.trim() || item.trim().length > 40)
      )
        errors[key] = 'Use up to 20 items of 1-40 characters each.'
    }
    if (details.collaboration.some((item) => !COLLABORATION_OPTIONS.includes(item)))
      errors.collaboration = 'Choose one of the collaboration preferences.'
  }
  if (!step || step === 6 || step === 7) {
    if (details.links.length > 20) errors.links = 'Use up to 20 links.'
    details.links.forEach((link) => {
      try {
        normalizeLink(link)
      } catch (error) {
        errors[`link-${link.id}`] = error instanceof Error ? error.message : 'Check this link.'
      }
    })
  }
  return errors
}

export function normalizeOnboarding(details: OnboardingDetails): OnboardingDetails {
  const errors = onboardingErrors(details)
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0])
  const result = { ...details, links: details.links.map(normalizeLink) }
  for (const key of [
    'firstName',
    'lastName',
    'displayName',
    'program',
    'headline',
    'bio',
    'introduction',
  ] as const)
    result[key] = result[key].trim()
  for (const key of [
    'skills',
    'languages',
    'frameworks',
    'tools',
    'interests',
    'roles',
    'collaboration',
  ] as const)
    result[key] = [
      ...new Map(result[key].map((item) => [item.trim().toLowerCase(), item.trim()])).values(),
    ]
  return result
}

export function onboardingPreview(details: OnboardingDetails, id: string): PublicProfile {
  return {
    id,
    name:
      details.displayName.trim() ||
      `${details.firstName} ${details.lastName}`.trim().slice(0, 80) ||
      'Your name',
    avatarUrl: details.avatarUrl,
    program: details.program,
    studyYear: details.studyYear,
    bio: details.bio,
    skills: details.skills,
    githubUrl: null,
    developer: publicDeveloperDetails(details),
    links: details.links
      .filter((link) => link.isPublic)
      .flatMap((link) => {
        try {
          return [normalizeLink(link)]
        } catch {
          return []
        }
      }),
  }
}

export function publicDeveloperDetails(details: DeveloperProfile): DeveloperProfile {
  return {
    headline: details.headline,
    introduction: details.introduction,
    graduationYear: details.graduationYear,
    languages: details.languages,
    frameworks: details.frameworks,
    tools: details.tools,
    interests: details.interests,
    roles: details.roles,
    collaboration: details.collaboration,
    avatarPath: details.avatarPath,
    bannerPath: details.bannerPath,
    bannerUrl: details.bannerUrl,
  }
}

export function resumeOnboardingStep(step: number, details: OnboardingDetails): number {
  return Object.keys(onboardingErrors(details, 3)).length ? 3 : Math.min(7, Math.max(3, step))
}
