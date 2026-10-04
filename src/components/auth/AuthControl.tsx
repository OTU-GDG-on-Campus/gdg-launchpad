// Navbar auth widget: link to login when signed out, name and sign-out when signed in.

import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth/useAuth'

export function AuthControl() {
  const { status, user, isAdmin, signOut } = useAuth()

  if (status === 'loading') return <span className="text-ink-muted text-sm">Signing in...</span>

  if (!user) {
    return (
      <Link
        to="/login"
        className="bg-brand-500 text-on-brand hover:bg-brand-600 inline-flex min-h-8 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors"
      >
        Login
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {isAdmin && (
        <Link to="/admin" className="text-ink-muted hover:text-ink text-sm font-medium">
          Admin
        </Link>
      )}
      <span className="hidden text-sm font-medium sm:inline">{user.name}</span>
      <Button size="sm" variant="secondary" onClick={() => void signOut()}>
        Sign out
      </Button>
    </div>
  )
}
