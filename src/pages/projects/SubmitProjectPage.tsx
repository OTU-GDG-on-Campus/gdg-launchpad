// Project submission. Signed-in, registered students send a project in for coordinator review.

import { RequireAuth } from '@/components/auth/RequireAuth'
import { SubmitProjectForm } from '@/components/projects/SubmitProjectForm'
import { PageHeader } from '@/components/ui/PageHeader'

export function SubmitProjectPage() {
  return (
    <RequireAuth>
      <PageHeader
        title="Post a project"
        description="Submissions are reviewed by a coordinator before they appear on the feed."
      />
      <div className="max-w-2xl">
        <SubmitProjectForm />
      </div>
    </RequireAuth>
  )
}
