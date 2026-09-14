// Auth context shape shared by AuthProvider and the useAuth hook.

import { createContext } from 'react'
import type { User } from '@/types'

export type AuthStatus = 'loading' | 'signed-out' | 'signed-in'

export interface AuthContextValue {
  status: AuthStatus
  user: User | null
  /** True when a signed-in, non-banned user may post, upvote, and comment. */
  canParticipate: boolean
  isAdmin: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  error: string | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)
