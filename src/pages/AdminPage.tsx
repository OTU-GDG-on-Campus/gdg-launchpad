// Admin panel shell: the featured project picker is live, and moderation, user management, and
// bans land here next.

import { FeaturedProjectPicker } from '@/components/projects/FeaturedProjectPicker'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'

const PLANNED_SECTIONS = [
  { title: 'Moderation queue', detail: 'Approve or reject pending project submissions.' },
  { title: 'Users', detail: 'Search students, review activity, ban and unban accounts.' },
  { title: 'Sprints', detail: 'Create sprints, set dates, and publish montage links.' },
]

export function AdminPage() {
  return (
    <RequireAuth adminOnly>
      <PageHeader title="Admin" description="Moderation and member management for coordinators." />
      <div className="space-y-6">
        <div className="max-w-2xl">
          <FeaturedProjectPicker />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLANNED_SECTIONS.map((section) => (
            <Card key={section.title}>
              <h2 className="font-semibold">{section.title}</h2>
              <p className="text-ink-muted mt-1 text-sm">{section.detail}</p>
              <p className="text-ink-muted mt-3 text-xs">Not built yet</p>
            </Card>
          ))}
        </div>
      </div>
    </RequireAuth>
  )
}
