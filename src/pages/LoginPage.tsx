// Login page matching the supplied card design. Existing students log in with an emailed code.

import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { EmailCodeForm } from '@/components/auth/EmailCodeForm'
import { Wordmark } from '@/components/ui/Logo'
import { ALLOWED_EMAIL_DOMAINS } from '@/config/site'
import { useAuth } from '@/lib/auth/useAuth'

export function LoginPage() {
  const { user, error } = useAuth()

  let panel: ReactNode = <EmailCodeForm mode="login" />
  if (user && !user.registeredAt) {
    panel = (
      <div
        role="status"
        className="border-line bg-brand-50 mt-5 rounded-lg border p-4 text-sm leading-relaxed"
      >
        <p>Your email is verified, but your account is not finished yet.</p>
        <Link to="/register" className="text-brand-700 mt-2 inline-block font-semibold">
          Finish creating your account <span aria-hidden="true">→</span>
        </Link>
      </div>
    )
  } else if (user) {
    panel = (
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
    )
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
          Enter the Ontario Tech email you registered with and we will send you a six digit code.
          There is no password. You can browse projects without signing in.
        </p>

        {error && (
          <p role="alert" className="border-flare text-ink mt-5 rounded-lg border p-3 text-sm">
            {error}
          </p>
        )}
        {panel}
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
