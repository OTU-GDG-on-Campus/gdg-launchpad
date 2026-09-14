// Fallback route for unmatched URLs.

import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/PageState'

export function NotFoundPage() {
  return (
    <div className="space-y-4">
      <EmptyState title="Page not found" hint="That URL does not match anything on LaunchPad." />
      <div className="flex justify-center">
        <Link to="/">
          <Button variant="secondary">Back to projects</Button>
        </Link>
      </div>
    </div>
  )
}
