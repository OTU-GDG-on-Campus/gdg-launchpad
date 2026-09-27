// Auth provider. Uses Supabase Google sign-in when VITE_SUPABASE_* is set, and falls back to a
// local demo student otherwise so the UI still runs on mock data. See docs/auth.md for the flow.

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  getCurrentUser,
  isBackendConfigured,
  signInWithGoogle,
  signOutUser,
  subscribeToAuthChanges,
} from '@/lib/api/client'
import type { User } from '@/types'
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context'
import { allowedDomainsLabel, isAllowedStudentEmail } from './domain'

const OAUTH_ERROR_PARAMS = ['error', 'error_code', 'error_description']

/** Reads and strips the error Supabase appends to the URL when the sign-up trigger rejects. */
function takeOAuthError(): string | null {
  const url = new URL(window.location.href)
  const hash = new URLSearchParams(url.hash.slice(1))
  const description =
    url.searchParams.get('error_description') ??
    hash.get('error_description') ??
    url.searchParams.get('error') ??
    hash.get('error')
  if (!description) return null

  OAUTH_ERROR_PARAMS.forEach((param) => {
    url.searchParams.delete(param)
    hash.delete(param)
  })
  url.hash = hash.toString()
  window.history.replaceState(null, '', url.toString())
  return description
}

function domainError(): string {
  return `Sign in with your Ontario Tech Google account (${allowedDomainsLabel()}).`
}

const initialError = isBackendConfigured && takeOAuthError() ? domainError() : null

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(isBackendConfigured ? 'loading' : 'signed-out')
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(initialError)

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

  const signIn = useCallback(async () => {
    setStatus('loading')
    setError(null)

    if (!isBackendConfigured) {
      applyUser(await getCurrentUser())
      return
    }

    try {
      await signInWithGoogle(window.location.href)
    } catch {
      setStatus('signed-out')
      setError('Google sign-in could not start. Try again.')
    }
  }, [applyUser])

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
