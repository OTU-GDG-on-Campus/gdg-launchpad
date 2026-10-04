// Login page matching the supplied card design and using the existing demo auth provider.

import { useState } from 'react'
import { Link } from 'react-router'
import { OntarioTechSignInButton } from '@/components/auth/OntarioTechSignInButton'
import { Wordmark } from '@/components/ui/Logo'
import { ALLOWED_EMAIL_DOMAINS } from '@/config/site'
import { useAuth } from '@/lib/auth/useAuth'

export function LoginPage() {
  const { status, user, error, signIn } = useAuth()
  const [requestError, setRequestError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const isBusy = pending || status === 'loading'
  const message = requestError ?? error

  async function handleSignIn() {
    if (isBusy) return
    setRequestError(null)
    setPending(true)
    try {
      await signIn()
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
      aria-labelledby="login-title"
      className="landing-grid border-line grid min-h-140 place-items-center border-b px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="border-line bg-surface w-full max-w-110 rounded-2xl border p-6 shadow-lg sm:p-9">
        <Wordmark />
        <h1 id="login-title" className="mt-5 text-3xl font-extrabold tracking-tight">
          Sign in to LaunchPad
        </h1>
        <p className="text-ink-soft mt-3 text-sm leading-relaxed">
          Use your Ontario Tech Google account to participate. You can browse projects without
          signing in.
        </p>
        <p className="border-line bg-surface-raised text-ink-muted mt-5 rounded-lg border p-3 text-xs leading-relaxed">
          Demo preview: sign-in currently opens a sample account. It does not connect to Google yet.
        </p>

        {message && (
          <p role="alert" className="border-flare text-ink mt-5 rounded-lg border p-3 text-sm">
            {message}
          </p>
        )}
        {user ? (
          <div
            role="status"
            className="border-line bg-brand-50 mt-5 rounded-lg border p-4 text-sm leading-relaxed"
          >
            <p>
              You're signed in as <strong>{user.name}</strong>.
            </p>
            <Link to="/projects" className="text-brand-700 mt-2 inline-block font-semibold">
              Explore projects <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : (
          <OntarioTechSignInButton pending={isBusy} onClick={() => void handleSignIn()} />
        )}
        <p className="text-ink-muted mt-4 font-mono text-[10px] leading-relaxed tracking-wide uppercase">
          Allowed domains · {ALLOWED_EMAIL_DOMAINS.map((domain) => `@${domain}`).join(' · ')}
        </p>
        <p className="border-line text-ink-soft mt-6 border-t pt-5 text-sm">
          New to LaunchPad?{' '}
          <Link to="/register" className="text-brand-700 hover:text-flare font-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  )
}
