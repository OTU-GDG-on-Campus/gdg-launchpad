// Auth provider. Signs students in with an emailed code through Supabase when VITE_SUPABASE_* is
// set, and falls back to a local demo student otherwise. See docs/auth.md for the flow.

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  getCurrentUser,
  isBackendConfigured,
  saveRegistration,
  sendEmailCode,
  signOutUser,
  startDemoRegistration,
  subscribeToAuthChanges,
  verifyEmailCode,
} from '@/lib/api/client'
import type { RegistrationDetails, User } from '@/types'
import { AuthContext, type AuthContextValue, type AuthMode, type AuthStatus } from './auth-context'
import { allowedDomainsLabel, isAllowedStudentEmail } from './domain'

function domainError(): string {
  return `Use your Ontario Tech email address (${allowedDomainsLabel()}).`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(isBackendConfigured ? 'loading' : 'signed-out')
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  const applyUser = useCallback((next: User | null) => {
    if (next && !isAllowedStudentEmail(next.email)) {
      setUser(null)
      setStatus('signed-out')
      setError(domainError())
      return
    }
    setUser(next)
    setStatus(next ? 'signed-in' : 'signed-out')
  }, [])

  useEffect(() => {
    if (!isBackendConfigured) return
    const refresh = () =>
      getCurrentUser()
        .then(applyUser)
        .catch(() => {
          applyUser(null)
          setError('Could not load your account. Try signing in again.')
        })
    void refresh()
    return subscribeToAuthChanges(() => void refresh())
  }, [applyUser])

  const sendCode = useCallback(async (email: string, mode: AuthMode) => {
    if (!isAllowedStudentEmail(email)) throw new Error(domainError())
    await sendEmailCode(email, mode)
  }, [])

  const verifyCode = useCallback(
    async (email: string, code: string, mode: AuthMode) => {
      await verifyEmailCode(email, code)
      const next =
        !isBackendConfigured && mode === 'register'
          ? startDemoRegistration(email)
          : await getCurrentUser()
      if (!next) throw new Error('Your account could not be loaded. Try again.')
      setError(null)
      applyUser(next)
    },
    [applyUser],
  )

  const completeRegistration = useCallback(
    async (details: RegistrationDetails) => {
      if (!user) throw new Error('Verify your email first.')
      applyUser(await saveRegistration(user, details))
    },
    [user, applyUser],
  )

  const signOut = useCallback(async () => {
    try {
      await signOutUser()
    } finally {
      setUser(null)
      setStatus('signed-out')
      setError(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      canParticipate:
        status === 'signed-in' &&
        user !== null &&
        user.bannedAt === null &&
        user.registeredAt !== null,
      isAdmin: user?.role === 'admin',
      sendCode,
      verifyCode,
      completeRegistration,
      signOut,
      error,
    }),
    [status, user, sendCode, verifyCode, completeRegistration, signOut, error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
