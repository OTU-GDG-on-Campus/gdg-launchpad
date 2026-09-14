// Route guard for pages that need a signed-in student, or an admin when adminOnly is set.
//
// This hides UI only. Every protected action is re-checked server-side.

import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/PageState'
import { allowedDomainsLabel } from '@/lib/auth/domain'
import { useAuth } from '@/lib/auth/useAuth'

interface RequireAuthProps {
  children: ReactNode
  adminOnly?: boolean
}

export function RequireAuth({ children, adminOnly = false }: RequireAuthProps) {
  const { canParticipate, isAdmin, signIn } = useAuth()

  if (!canParticipate) {
    return (
      <div className="space-y-4">
        <EmptyState
          title="Students only"
          hint={`Sign in with your Ontario Tech account (${allowedDomainsLabel()}) to continue.`}
        />
        <div className="flex justify-center">
          <Button onClick={() => void signIn()}>Sign in with Ontario Tech</Button>
        </div>
      </div>
    )
  }

  if (adminOnly && !isAdmin) {
    return <EmptyState title="Admins only" hint="Your account does not have admin access." />
  }

  return <>{children}</>
}
