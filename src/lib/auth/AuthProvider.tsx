// Session provider for verified Supabase accounts and an isolated, persistent local demo login.

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  getCurrentUser,
  signInDemo,
  resetDemoData,
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
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  const revision = useRef(0)

  const applyUser = useCallback((next: User | null) => {
    revision.current += 1
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
    let active = true
    const refresh = () => {
      const request = ++revision.current
      return getCurrentUser()
        .then((next) => {
          if (active && request === revision.current) applyUser(next)
        })
        .catch(() => {
          if (!active || request !== revision.current) return
          applyUser(null)
          setError('Could not load your account. Try signing in again.')
        })
    }
    void refresh()
    const unsubscribe = subscribeToAuthChanges(() => void refresh())
    return () => {
      active = false
      unsubscribe()
    }
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

  const demoLogin = useCallback(async () => {
    applyUser(await signInDemo())
    setError(null)
  }, [applyUser])

  const refreshUser = useCallback(async () => {
    const request = ++revision.current
    const next = await getCurrentUser()
    if (request === revision.current) applyUser(next)
  }, [applyUser])

  const resetDemo = useCallback(async () => {
    applyUser(await resetDemoData())
  }, [applyUser])

  const completeRegistration = useCallback(
    async (details: RegistrationDetails) => {
      if (!user) throw new Error('Verify your email first.')
      const request = revision.current
      const next = await saveRegistration(user, details)
      if (request === revision.current) applyUser(next)
    },
    [user, applyUser],
  )

  const signOut = useCallback(async () => {
    revision.current += 1
    await signOutUser()
    applyUser(null)
    setError(null)
  }, [applyUser])

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
      demoLogin,
      refreshUser,
      resetDemo,
      signOut,
      error,
    }),
    [
      status,
      user,
      sendCode,
      verifyCode,
      completeRegistration,
      demoLogin,
      refreshUser,
      resetDemo,
      signOut,
      error,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
