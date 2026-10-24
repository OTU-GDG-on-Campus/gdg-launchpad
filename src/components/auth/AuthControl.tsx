// Account navigation: clickable name and profile icon, dashboard link, and existing sign-out.

import { useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '@/lib/auth/useAuth'

export function AuthControl() {
  const { status, user, isAdmin, signOut } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  if (status === 'loading')
    return (
      <span role="status" className="text-ink-muted text-xs">
        Loading account...
      </span>
    )
  if (!user)
    return (
      <Link
        to="/login"
        className="bg-brand-500 text-on-brand hover:bg-brand-600 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors"
      >
        Login
      </Link>
    )

  async function handleSignOut() {
    if (pending) return
    setPending(true)
    setError(null)
    try {
      await signOut()
    } catch {
      setError('Sign-out could not be confirmed. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="relative flex flex-wrap items-center justify-end gap-2 sm:gap-3">
      {isAdmin && (
        <Link to="/admin" className="text-ink-soft hover:text-brand-700 text-xs font-semibold">
          Admin
        </Link>
      )}
      <Link
        to="/dashboard"
        className="text-ink-soft hover:text-brand-700 text-xs font-semibold sm:text-sm"
      >
        Dashboard
      </Link>
      <Link
        to="/profile"
        className="text-ink-soft hover:text-brand-700 hidden max-w-36 truncate text-sm font-semibold sm:inline"
      >
        {user.name}
      </Link>
      <Link
        to="/profile"
        aria-label="View your profile"
        title="Your profile"
        className="border-line text-brand-700 hover:border-brand-700 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border"
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="h-5 w-5"
          >
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
          </svg>
        )}
      </Link>
      <button
        type="button"
        disabled={pending}
        onClick={() => void handleSignOut()}
        className="border-line bg-surface hover:border-brand-700 rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50 sm:text-sm"
      >
        {pending ? 'Signing out...' : 'Sign out'}
      </button>
      {error && (
        <p
          role="alert"
          className="border-line bg-surface absolute top-full right-0 mt-2 w-64 rounded-lg border p-3 text-xs"
        >
          {error}
        </p>
      )}
    </div>
  )
}
