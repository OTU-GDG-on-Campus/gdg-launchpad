// One sprint: its brief, dates, and the projects submitted to it.

import { useParams } from 'react-router'
import { ProjectList } from '@/components/projects/ProjectList'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageState'
import { useProjectFeed } from '@/hooks/useProjectFeed'
import { getSprintBySlug } from '@/lib/api/client'
import { formatDateRange } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'

export function SprintDetailPage() {
  const { slug = '' } = useParams()
  const { data: sprint, loading, error } = useAsync(() => getSprintBySlug(slug), slug)
  const feed = useProjectFeed({ sort: 'top', sprintId: sprint?.id })

  if (error) return <ErrorState error={error} />
  if (loading) return <LoadingState label="Loading sprint" />
  if (!sprint) return <EmptyState title="Sprint not found" />

  return (
    <>
      <PageHeader
        title={sprint.title}
        description={`${sprint.theme} - ${formatDateRange(sprint.startDate, sprint.endDate)}`}
      />

      <Card className="mb-8">
        <p className="text-sm leading-relaxed">{sprint.description}</p>
      </Card>

      <h2 className="mb-3 text-lg font-semibold">Submissions</h2>
      {feed.loading ? (
        <LoadingState label="Loading submissions" />
      ) : (
        <ProjectList
          projects={feed.projects}
          onUpvote={(id) => void feed.upvote(id)}
          emptyTitle="No submissions yet"
          emptyHint="Projects appear here once the sprint opens and entries are approved."
        />
      )}
    </>
  )
}
