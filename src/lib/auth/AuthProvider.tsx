// Auth provider. Currently backed by a local demo session so the UI can be built before
// Supabase Google OAuth is wired in. Swap the body of signIn/signOut only - the context
// shape and every consumer stay the same. See docs/auth.md for the real flow.

import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context'
import { allowedDomainsLabel, isAllowedStudentEmail } from './domain'
import { DEMO_USER } from '@/lib/api/mock/users'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('signed-out')
  const [user, setUser] = useState<AuthContextValue['user']>(null)
  const [error, setError] = useState<string | null>(null)

  const signIn = useCallback(async () => {
    setStatus('loading')
    setError(null)

    if (!isAllowedStudentEmail(DEMO_USER.email)) {
      setStatus('signed-out')
      setError(`Sign in with your Ontario Tech account (${allowedDomainsLabel()}).`)
      return
    }

    setUser(DEMO_USER)
    setStatus('signed-in')
  }, [])

  const signOut = useCallback(async () => {
    setUser(null)
    setStatus('signed-out')
    setError(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      canParticipate: status === 'signed-in' && user !== null && user.bannedAt === null,
      isAdmin: user?.role === 'admin',
      signIn,
      signOut,
      error,
    }),
    [status, user, signIn, signOut, error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
