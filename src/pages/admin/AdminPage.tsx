// Admin panel: the featured project picker, the moderation queue, and discussion moderation are
// live. User management and sprint management land here next.

import { DiscussionModeration } from '@/components/projects/admin/DiscussionModeration'
import { FeaturedProjectPicker } from '@/components/projects/admin/FeaturedProjectPicker'
import { ModerationQueue } from '@/components/projects/admin/ModerationQueue'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'

const PLANNED_SECTIONS = [
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
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <ModerationQueue />
          <DiscussionModeration />
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
