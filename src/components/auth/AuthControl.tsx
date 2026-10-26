// Signed-in avatar navigation with keyboard focus, outside dismissal, and sign-out feedback.

import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Avatar } from '@/components/ui/Avatar'
import { ACCOUNT_LINKS } from '@/config/account'
import { useAuth } from '@/lib/auth/useAuth'

export function AuthControl() {
  const { status, user, isAdmin, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const pathname = useLocation().pathname
  const contextKey = `${pathname}|${user?.id ?? 'none'}`
  const [menuContext, setMenuContext] = useState(contextKey)
  if (menuContext !== contextKey) {
    setMenuContext(contextKey)
    setOpen(false)
  }
  useEffect(() => {
    if (!open) return
    ref.current?.querySelector<HTMLAnchorElement>('a')?.focus()
    function outside(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    function keyboard(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', keyboard)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', keyboard)
    }
  }, [open])
  if (status === 'loading')
    return <span className="text-ink-muted text-sm">Checking session...</span>
  if (!user)
    return (
      <Link
        to="/login"
        className="bg-brand-500 text-on-brand hover:bg-brand-600 inline-flex min-h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium"
      >
        Login
      </Link>
    )
  return (
    <div
      ref={ref}
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls="account-navigation"
        aria-label={`Open account navigation for ${user.name}`}
        onClick={() => setOpen((current) => !current)}
        className="border-line bg-surface flex min-h-10 items-center gap-2 rounded-full border p-1 pr-3"
      >
        <Avatar name={user.name} src={user.avatarUrl} size="sm" />
        <span className="hidden max-w-28 truncate text-sm font-semibold sm:inline">
          {user.name}
        </span>
        <span aria-hidden="true" className="text-ink-muted text-xs">
          &#9662;
        </span>
      </button>
      {open && (
        <nav
          id="account-navigation"
          aria-label="Account menu"
          className="border-line bg-surface shadow-card-hover absolute right-0 z-60 mt-3 max-h-[75vh] w-64 overflow-y-auto rounded-xl border p-2"
        >
          <p className="text-ink-muted border-line mb-2 border-b px-3 py-3 text-xs">
            Your LaunchPad
          </p>
          {ACCOUNT_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="hover:bg-surface-raised flex min-h-10 items-center rounded-lg px-3 py-2 text-sm"
            >
              {link.label}
            </Link>
          ))}
          {user.registeredAt && !user.bannedAt && (
            <Link
              to={`/u/${user.id}`}
              onClick={() => setOpen(false)}
              className="hover:bg-surface-raised flex min-h-10 items-center rounded-lg px-3 py-2 text-sm"
            >
              View public profile &#8599;
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="hover:bg-surface-raised flex min-h-10 items-center rounded-lg px-3 py-2 text-sm"
            >
              Admin
            </Link>
          )}
          <div className="border-line mt-2 border-t pt-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setPending(true)
                setError(null)
                void signOut()
                  .catch(() => setError('Could not confirm server sign-out.'))
                  .finally(() => setPending(false))
              }}
              className="hover:bg-surface-raised min-h-10 w-full rounded-lg px-3 py-2 text-left text-sm disabled:opacity-50"
            >
              {pending ? 'Signing out...' : 'Sign out'}
            </button>
            {error && (
              <p role="alert" className="text-danger px-3 py-2 text-xs">
                {error}
              </p>
            )}
          </div>
        </nav>
      )}
    </div>
  )
}
