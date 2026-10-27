// Auth context shape shared by AuthProvider and the useAuth hook.

import { createContext } from 'react'
import type { RegistrationDetails, User } from '@/types'

export type AuthStatus = 'loading' | 'signed-out' | 'signed-in'

/** Logging in only works for existing accounts. Registering is the one way to create one. */
export type AuthMode = 'login' | 'register'

export interface AuthContextValue {
  status: AuthStatus
  user: User | null
  /** True when a signed-in, registered, non-banned user may post, upvote, and comment. */
  canParticipate: boolean
  isAdmin: boolean
  /** Emails a sign-in code. Throws a message safe to show the student. */
  sendCode: (email: string, mode: AuthMode) => Promise<void>
  /** Verifies the emailed code and signs the student in. Throws a message safe to show. */
  verifyCode: (email: string, code: string, mode: AuthMode) => Promise<void>
  /** Saves the registration details for the signed-in student and finishes their account. */
  completeRegistration: (details: RegistrationDetails) => Promise<void>
  demoLogin: () => Promise<void>
  refreshUser: () => Promise<void>
  resetDemo: () => Promise<void>
  signOut: () => Promise<void>
  error: string | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)
