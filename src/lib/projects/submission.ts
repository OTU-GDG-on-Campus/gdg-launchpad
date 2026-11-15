// Validation and slug helpers for the project submission form. The limits mirror the CHECK
// constraints on the projects table, which stay the real enforcement. This only gives the student
// field-level messages before anything is sent.

import { PROJECT_CATEGORIES } from '@/config/site'
import type { ProjectSubmission } from '@/types'

export const SUBMISSION_LIMITS = {
  titleMin: 3,
  titleMax: 80,
  summaryMin: 10,
  summaryMax: 160,
  descriptionMax: 5000,
  tagsMax: 8,
  tagMax: 30,
} as const

export interface SubmissionInput {
  title: string
  summary: string
  description: string
  category: string
  tags: string
  repoUrl: string
  liveUrl: string
  openToContributions: boolean
}

export type SubmissionErrors = Partial<Record<keyof SubmissionInput, string>>

export type SubmissionResult =
  { ok: true; value: ProjectSubmission } | { ok: false; errors: SubmissionErrors }

export const EMPTY_SUBMISSION: SubmissionInput = {
  title: '',
  summary: '',
  description: '',
  category: '',
  tags: '',
  repoUrl: '',
  liveUrl: '',
  openToContributions: false,
}

function splitTags(value: string): string[] {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

/** Splits a comma list into unique tags, ignoring case when removing duplicates. */
export function parseTags(value: string): string[] {
  const seen = new Set<string>()
  const tags: string[] = []
  for (const tag of splitTags(value)) {
    const key = tag.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    tags.push(tag)
  }
  return tags
}

function checkUrl(value: string): { url: string | null; valid: boolean } {
  const trimmed = value.trim()
  if (!trimmed) return { url: null, valid: true }
  try {
    const parsed = new URL(trimmed)
    return { url: trimmed, valid: parsed.protocol === 'https:' || parsed.protocol === 'http:' }
  } catch {
    return { url: null, valid: false }
  }
}

export function validateSubmission(input: SubmissionInput): SubmissionResult {
  const errors: SubmissionErrors = {}
  const limits = SUBMISSION_LIMITS

  const title = input.title.trim()
  if (title.length < limits.titleMin || title.length > limits.titleMax) {
    errors.title = `Use ${limits.titleMin} to ${limits.titleMax} characters.`
  }

  const summary = input.summary.trim()
  if (summary.length < limits.summaryMin || summary.length > limits.summaryMax) {
    errors.summary = `Use ${limits.summaryMin} to ${limits.summaryMax} characters.`
  }

  const description = input.description.trim()
  if (description.length > limits.descriptionMax) {
    errors.description = `Keep it under ${limits.descriptionMax} characters.`
  }

  const category = PROJECT_CATEGORIES.find((option) => option === input.category)
  if (!category) errors.category = 'Choose a category.'

  const tags = parseTags(input.tags)
  if (tags.length > limits.tagsMax) {
    errors.tags = `Use at most ${limits.tagsMax} tags.`
  } else if (splitTags(input.tags).some((tag) => tag.length > limits.tagMax)) {
    errors.tags = `Each tag must be ${limits.tagMax} characters or fewer.`
  }

  const repo = checkUrl(input.repoUrl)
  if (!repo.valid) errors.repoUrl = 'Enter a full link that starts with http:// or https://.'
  const live = checkUrl(input.liveUrl)
  if (!live.valid) errors.liveUrl = 'Enter a full link that starts with http:// or https://.'

  if (Object.keys(errors).length > 0 || !category) return { ok: false, errors }

  return {
    ok: true,
    value: {
      title,
      summary,
      description,
      category,
      tags,
      repoUrl: repo.url,
      liveUrl: live.url,
      openToContributions: input.openToContributions,
    },
  }
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 7).padEnd(5, '0')
}

/** Builds a URL-safe slug from a title. The suffix keeps two projects with one title apart. */
export function slugifyTitle(title: string, suffix: string = randomSuffix()): string {
  const base = title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
    .replace(/-+$/g, '')
  return `${base || 'project'}-${suffix}`
}
