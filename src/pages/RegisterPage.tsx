// Two-step registration design: existing demo sign-in followed by an unsaved profile form.

import { useState } from 'react'
import { Link } from 'react-router'
import { OntarioTechSignInButton } from '@/components/auth/OntarioTechSignInButton'
import { Wordmark } from '@/components/ui/Logo'
import { ALLOWED_EMAIL_DOMAINS } from '@/config/site'
import { cn } from '@/lib/cn'
import { useAuth } from '@/lib/auth/useAuth'

const PROGRAMS = [
  'Computer Science',
  'Software Engineering',
  'Electrical Engineering',
  'Mechatronics Engineering',
  'Business & IT',
]
const YEARS = ['Year 1', 'Year 2', 'Year 3', 'Year 4']
const PERKS = [
  'Share your projects with other students',
  'Upvote and join discussions on projects you like',
  'Find inspiration and collaborators for your next project',
]
const FIELD_CLASS =
  'border-line bg-surface-muted text-ink focus:border-brand-700 mt-2 min-h-12 w-full rounded-lg border px-3 py-3 text-sm'

export function RegisterPage() {
  const { status, user, error, signIn } = useAuth()
  const [showIntro, setShowIntro] = useState(false)
  const [pending, setPending] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [program, setProgram] = useState('')
  const [year, setYear] = useState('')
  const [skills, setSkills] = useState('')
  const [bio, setBio] = useState('')
  const [agreed, setAgreed] = useState(false)
  const step = user && !showIntro ? 2 : 1
  const isBusy = pending || status === 'loading'
  const message = requestError ?? error
  const detailsComplete = Boolean(name.trim() && program && year && agreed)

  async function handleConnect() {
    if (isBusy) return
    setRequestError(null)
    if (user) {
      setShowIntro(false)
      return
    }
    setPending(true)
    try {
      await signIn()
      setShowIntro(false)
    } catch (cause) {
      setRequestError(
        cause instanceof Error ? cause.message : 'Unable to sign in. Please try again.',
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <section
      aria-labelledby="register-title"
      className="landing-grid border-line grid min-h-140 place-items-center border-b px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="border-line bg-surface w-full max-w-135 rounded-2xl border p-6 shadow-lg sm:p-9">
        <Wordmark />
        <p className="text-ink-muted mt-6 font-mono text-xs tracking-wide uppercase">
          Create account · Step {step} of 2
        </p>
        <h1 id="register-title" className="mt-3 text-3xl font-extrabold tracking-tight">
          {step === 1 ? 'Join LaunchPad' : 'Set up your profile'}
        </h1>
        <div aria-hidden="true" className="mt-5 flex gap-2">
          <span className="bg-brand-700 h-1 flex-1 rounded-full" />
          <span
            className={cn('h-1 flex-1 rounded-full', step === 2 ? 'bg-brand-700' : 'bg-line')}
          />
        </div>
        {message && (
          <p role="alert" className="border-flare text-ink mt-5 rounded-lg border p-3 text-sm">
            {message}
          </p>
        )}

        {step === 1 ? (
          <div>
            <p className="text-ink-soft mt-5 text-sm leading-relaxed">
              LaunchPad is designed to use your Ontario Tech Google account, so there's no password
              to create. Browsing never needs an account.
            </p>
            <ul className="mt-5 space-y-3">
              {PERKS.map((perk) => (
                <li key={perk} className="text-ink-soft flex gap-3 text-sm leading-relaxed">
                  <span
                    aria-hidden="true"
                    className="bg-flare mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                  />
                  {perk}
                </li>
              ))}
            </ul>
            <OntarioTechSignInButton
              pending={isBusy}
              onClick={() => void handleConnect()}
              label={user ? 'Continue to profile' : 'Continue with Ontario Tech'}
            />
            <p className="text-ink-muted mt-4 font-mono text-[10px] leading-relaxed tracking-wide uppercase">
              Allowed domains · {ALLOWED_EMAIL_DOMAINS.map((domain) => `@${domain}`).join(' · ')}
            </p>
            <p className="border-line bg-surface-raised text-ink-muted mt-5 rounded-lg border p-3 text-xs leading-relaxed">
              Demo preview: this opens a sample account. Google sign-in and saving a new profile are
              not available yet.
            </p>
          </div>
        ) : (
          <div>
            <div className="border-line bg-accent-soft mt-5 flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm">
              <span className="min-w-0 font-semibold break-all">{user?.email}</span>
              <span className="text-accent font-mono text-[10px] tracking-wide uppercase">
                Demo account
              </span>
            </div>
            <form onSubmit={(event) => event.preventDefault()} className="mt-6 space-y-5">
              <div>
                <label htmlFor="register-name" className="text-sm font-semibold">
                  Full name <span className="text-ink-muted">(required)</span>
                </label>
                <input
                  id="register-name"
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="As you want it shown on your profile"
                  className={FIELD_CLASS}
                />
              </div>
              <div>
                <label htmlFor="register-program" className="text-sm font-semibold">
                  Program <span className="text-ink-muted">(required)</span>
                </label>
                <select
                  id="register-program"
                  name="program"
                  required
                  value={program}
                  onChange={(event) => setProgram(event.target.value)}
                  className={FIELD_CLASS}
                >
                  <option value="">Select your program</option>
                  {PROGRAMS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="register-year" className="text-sm font-semibold">
                  Year <span className="text-ink-muted">(required)</span>
                </label>
                <select
                  id="register-year"
                  name="year"
                  required
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  className={FIELD_CLASS}
                >
                  <option value="">Select your year</option>
                  {YEARS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="register-skills" className="text-sm font-semibold">
                  Skills <span className="text-ink-muted">(optional)</span>
                </label>
                <input
                  id="register-skills"
                  name="skills"
                  maxLength={250}
                  value={skills}
                  onChange={(event) => setSkills(event.target.value)}
                  placeholder="React, Python, CAD..."
                  aria-describedby="skills-hint"
                  className={FIELD_CLASS}
                />
                <p id="skills-hint" className="text-ink-muted mt-2 text-xs">
                  Separate skills with commas.
                </p>
              </div>
              <div>
                <label htmlFor="register-bio" className="text-sm font-semibold">
                  Short bio <span className="text-ink-muted">(optional)</span>
                </label>
                <textarea
                  id="register-bio"
                  name="bio"
                  rows={3}
                  maxLength={500}
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="What do you like to build?"
                  className={cn(FIELD_CLASS, 'resize-y')}
                />
              </div>
              <label className="text-ink-soft flex items-start gap-3 text-sm leading-relaxed">
                <input
                  type="checkbox"
                  name="guidelines"
                  checked={agreed}
                  onChange={(event) => setAgreed(event.target.checked)}
                  className="accent-brand-700 mt-1 h-4 w-4 shrink-0"
                />
                I agree to the community guidelines. Projects are reviewed by a moderator before
                they appear publicly.
              </label>
              <div className="border-line flex flex-wrap justify-between gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={() => setShowIntro(true)}
                  className="border-line bg-surface text-ink hover:border-brand-700 min-h-11 rounded-lg border px-5 py-3 text-sm font-semibold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled
                  aria-describedby="registration-unavailable"
                  className="bg-brand-500 text-on-brand min-h-11 cursor-not-allowed rounded-lg px-5 py-3 text-sm font-semibold opacity-50"
                >
                  Create account
                </button>
              </div>
              <p
                id="registration-unavailable"
                role="status"
                className="text-ink-muted text-xs leading-relaxed"
              >
                {detailsComplete ? 'Your details are filled in. ' : ''}This form is a design
                preview. Account creation is not available yet, and these details are not saved. You
                can review the layout without creating an account.
              </p>
            </form>
          </div>
        )}
        <p className="border-line text-ink-soft mt-6 border-t pt-5 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-700 hover:text-flare font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  )
}
