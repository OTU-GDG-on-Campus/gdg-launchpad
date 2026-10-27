// UI guard for registered student and admin routes. Database policies enforce real access.

import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { EmptyState, LoadingState } from '@/components/ui/PageState'
import { allowedDomainsLabel } from '@/lib/auth/domain'
import { useAuth } from '@/lib/auth/useAuth'

interface RequireAuthProps {
  children: ReactNode
  adminOnly?: boolean
}

export function RequireAuth({ children, adminOnly = false }: RequireAuthProps) {
  const { status, user, canParticipate, isAdmin } = useAuth()

  if (status === 'loading') return <LoadingState label="Checking your session" />

  if (user?.bannedAt)
    return (
      <EmptyState
        title="Account unavailable"
        hint="This account cannot access participation features."
      />
    )

  if (!canParticipate) {
    const unfinished = user !== null && user.registeredAt === null
    return (
      <div className="space-y-4">
        <EmptyState
          title={unfinished ? 'Finish creating your account' : 'Students only'}
          hint={
            unfinished
              ? 'Your email is verified. Add your details to start posting and upvoting.'
              : `Sign in with your Ontario Tech email (${allowedDomainsLabel()}) to continue.`
          }
        />
        <div className="flex justify-center">
          <Link
            to={unfinished ? '/register' : '/login'}
            className="bg-brand-500 text-on-brand hover:bg-brand-600 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors"
          >
            {unfinished ? 'Finish registration' : 'Sign in'}
          </Link>
        </div>
      </div>
    )
  }

  if (adminOnly && !isAdmin) {
    return <EmptyState title="Admins only" hint="Your account does not have admin access." />
  }

  return <>{children}</>
}
