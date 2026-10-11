// Navbar auth widget: sign-in button and any sign-in error when signed out, name and sign-out
// when signed in.

import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth/useAuth'

export function AuthControl() {
  const { status, user, isAdmin, signIn, signOut, error } = useAuth()

  if (status === 'loading') return <span className="text-ink-muted text-sm">Signing in...</span>

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        {error && (
          <span role="alert" className="text-flare hidden max-w-64 text-xs md:inline">
            {error}
          </span>
        )}
        <Button size="sm" onClick={() => void signIn()}>
          Sign in with Ontario Tech
        </Button>
      </div>
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
