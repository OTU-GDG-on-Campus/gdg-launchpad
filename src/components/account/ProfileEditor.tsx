// Editable public profile fields with validated saves and an immediate auth-name refresh.

import { useState, type SyntheticEvent } from 'react'
import { Link } from 'react-router'
import { updateMyProfile } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/useAuth'
import { PROGRAMS, STUDY_YEARS } from '@/lib/profile'
import type { AccountProfile } from '@/types'

const FIELD =
  'border-line bg-surface text-ink mt-2 min-h-12 w-full rounded-lg border px-3 py-3 text-sm'

export function ProfileEditor({ profile }: { profile: AccountProfile }) {
  const { refreshUser } = useAuth()
  const [name, setName] = useState(profile.name)
  const [program, setProgram] = useState(profile.program)
  const [studyYear, setStudyYear] = useState(profile.studyYear)
  const [skills, setSkills] = useState(profile.skills.join(', '))
  const [bio, setBio] = useState(profile.bio)
  const [githubUrl, setGithubUrl] = useState(profile.githubUrl ?? '')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setPending(true)
    setError(null)
    setSaved(false)
    try {
      await updateMyProfile({ name, program, studyYear, skills: skills.split(','), bio, githubUrl })
      await refreshUser()
      setSaved(true)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save your profile.')
    } finally {
      setPending(false)
    }
  }
  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-6">
      <p className="border-line bg-surface-raised text-ink-soft rounded-xl border p-4 text-sm leading-relaxed">
        These details are public. Your email address and account settings stay private.
      </p>
      <div>
        <label htmlFor="profile-name" className="text-sm font-semibold">
          Display name
        </label>
        <input
          id="profile-name"
          autoComplete="name"
          required
          maxLength={80}
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            setSaved(false)
          }}
          className={FIELD}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-program" className="text-sm font-semibold">
            Program
          </label>
          <select
            id="profile-program"
            required
            value={program}
            onChange={(event) => {
              setProgram(event.target.value)
              setSaved(false)
            }}
            className={FIELD}
          >
            <option value="">Choose a program</option>
            {!PROGRAMS.includes(program) && program && <option value={program}>{program}</option>}
            {PROGRAMS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="profile-year" className="text-sm font-semibold">
            Study year
          </label>
          <select
            id="profile-year"
            required
            value={studyYear}
            onChange={(event) => {
              setStudyYear(event.target.value)
              setSaved(false)
            }}
            className={FIELD}
          >
            <option value="">Choose your year</option>
            {STUDY_YEARS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="profile-skills" className="text-sm font-semibold">
          Skills
        </label>
        <input
          id="profile-skills"
          value={skills}
          maxLength={820}
          onChange={(event) => {
            setSkills(event.target.value)
            setSaved(false)
          }}
          aria-describedby="profile-skills-hint"
          className={FIELD}
        />
        <p id="profile-skills-hint" className="text-ink-muted mt-2 text-xs">
          Separate with commas. Up to 20 skills, 40 characters each.
        </p>
      </div>
      <div>
        <label htmlFor="profile-bio" className="text-sm font-semibold">
          Bio
        </label>
        <textarea
          id="profile-bio"
          rows={4}
          maxLength={500}
          value={bio}
          onChange={(event) => {
            setBio(event.target.value)
            setSaved(false)
          }}
          className={FIELD}
        />
        <p className="text-ink-muted mt-2 text-xs">{bio.length}/500 characters</p>
      </div>
      <div>
        <label htmlFor="profile-github" className="text-sm font-semibold">
          GitHub profile URL <span className="text-ink-muted font-normal">(optional)</span>
        </label>
        <input
          id="profile-github"
          type="url"
          placeholder="https://github.com/username"
          value={githubUrl}
          onChange={(event) => {
            setGithubUrl(event.target.value)
            setSaved(false)
          }}
          className={FIELD}
        />
      </div>
      {error && (
        <p role="alert" className="border-danger rounded-lg border p-4 text-sm">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="bg-brand-50 text-brand-700 rounded-lg p-4 text-sm">
          Profile saved. Your public page is up to date.
        </p>
      )}
      <div className="border-line flex flex-wrap items-center gap-4 border-t pt-6">
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="bg-brand-500 text-on-brand hover:bg-brand-600 min-h-11 rounded-lg px-5 py-3 text-sm font-semibold disabled:opacity-50"
        >
          {pending ? 'Saving...' : 'Save profile'}
        </button>
        <Link
          to="/me/profile"
          className="text-brand-700 inline-flex min-h-11 items-center text-sm font-semibold"
        >
          Back to my profile
        </Link>
      </div>
    </form>
  )
}
