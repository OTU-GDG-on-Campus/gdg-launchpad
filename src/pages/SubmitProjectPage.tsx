// Project submission. Form fields are placeholders until the write API exists.

import { RequireAuth } from '@/components/auth/RequireAuth'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/PageState'

export function SubmitProjectPage() {
  return (
    <RequireAuth>
      <PageHeader
        title="Post a project"
        description="Submissions are reviewed by a coordinator before they appear on the feed."
      />
      <EmptyState
        title="Submission form is not built yet"
        hint="Next milestone: the form, file upload, and the moderation queue it feeds."
      />
    </RequireAuth>
  )
}
