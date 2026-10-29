// Profile input normalization shared by registration and the account editor.

import type { ProfileDetails } from '@/types'

export const PROGRAMS = [
  'Computer Science',
  'Software Engineering',
  'Information Technology',
  'Computer Engineering',
  'Electrical Engineering',
  'Mechatronics Engineering',
  'Business & IT',
]
export const STUDY_YEARS = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5+', 'Graduate']

export function normalizeProfile(details: ProfileDetails): ProfileDetails {
  const result = {
    studyYear: details.studyYear,
    name: details.name.trim(),
    program: details.program.trim(),
    bio: details.bio.trim(),
    skills: [...new Set(details.skills.map((skill) => skill.trim()).filter(Boolean))],
    githubUrl: details.githubUrl.trim(),
  }
  if (!result.name || result.name.length > 80)
    throw new Error('Name must be between 1 and 80 characters.')
  if (!result.program || result.program.length > 80)
    throw new Error('Enter a program of up to 80 characters.')
  if (!STUDY_YEARS.includes(result.studyYear)) throw new Error('Choose a study year from the list.')
  if (result.bio.length > 500) throw new Error('Bio must be 500 characters or fewer.')
  if (result.skills.length > 20 || result.skills.some((skill) => skill.length > 40))
    throw new Error('Use up to 20 skills, with 40 characters or fewer per skill.')
  if (result.githubUrl) {
    let url: URL
    try {
      url = new URL(result.githubUrl)
    } catch {
      throw new Error('Enter a valid GitHub profile URL.')
    }
    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'github.com' ||
      url.port ||
      url.username ||
      url.password ||
      !/^\/[a-zA-Z0-9-]+\/?$/.test(url.pathname) ||
      url.search ||
      url.hash
    ) {
      throw new Error('Use a GitHub profile URL such as https://github.com/username.')
    }
    result.githubUrl = url.href.replace(/\/$/, '')
  }
  return result
}
