// Semester Sprints landing page: what a sprint is, how it runs, why to join, and every sprint.

import { Link } from 'react-router'
import { SprintGrid } from '@/components/sprints/SprintGrid'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ErrorState, LoadingState } from '@/components/ui/PageState'
import { listSprints } from '@/lib/api/client'
import { formatDate, formatMonthYear } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'

const PHASES = [
  {
    number: '01',
    window: 'Weeks 1-2',
    title: 'Form and ideate',
    detail: 'Submit an idea or join an open one. Teams run up to 5 people, across any course.',
  },
  {
    number: '02',
    window: 'Weeks 3-6',
    title: 'Build',
    detail: 'Write code with weekly check-ins. Workshops cover the sprint theme end to end.',
  },
  {
    number: '03',
    window: 'Weeks 7-8',
    title: 'Polish and demo',
    detail: 'Clean up the repo, write a readable README, and demo the project to the group.',
  },
  {
    number: '04',
    window: 'After',
    title: 'Publish',
    detail: 'Your project goes on LaunchPad permanently, with a certificate and a montage spot.',
  },
]

const REASONS = [
  {
    title: 'Something worth showing',
    detail: 'Go past coursework. Build a project you would actually link on a resume.',
  },
  {
    title: 'Help when you get stuck',
    detail: 'Workshops and coordinators who have shipped the thing you are trying to ship.',
  },
  {
    title: 'A real audience',
    detail: 'Demo to the club, then leave the work on a page employers browse.',
  },
]

export function SprintsPage() {
  const { data: sprints, loading, error } = useAsync(() => listSprints(), 'sprints')
  const activeSprint = sprints?.find((sprint) => sprint.status === 'active')
  const nextSprint = activeSprint ?? sprints?.find((sprint) => sprint.status === 'upcoming')

  return (
    <>
      <section className="py-16 text-center sm:py-20">
        {nextSprint && <Badge tone="success">{formatMonthYear(nextSprint.startDate)} season</Badge>}
        <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">Semester Sprints</h1>
        <p className="text-ink-muted mx-auto mt-5 max-w-2xl text-sm leading-relaxed">
          Short building seasons where Ontario Tech students ship real projects together. Turn
          coursework theory into something live, build alongside other people, and finish with
          something you are glad to show.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {nextSprint && (
            <Link to={`/sprints/${nextSprint.slug}`}>
              <Button size="lg">
                {nextSprint.status === 'active' ? 'Join' : 'See'} the {nextSprint.title}
              </Button>
            </Link>
          )}
          <Link to="/projects">
            <Button size="lg" variant="secondary">
              View past submissions
            </Button>
          </Link>
        </div>
      </section>

      <section className="border-line border-t py-16">
        <h2 className="text-2xl font-semibold tracking-tight">What are Semester Sprints?</h2>
        <div className="text-ink-muted mt-4 grid max-w-4xl gap-6 text-sm leading-relaxed sm:grid-cols-2">
          <p>
            Each term the club runs a themed sprint. Students form teams, pick an idea, and build it
            over about three weeks with workshops and check-ins along the way.
          </p>
          <p>
            Think of it as a hackathon stretched across a few weeks instead of a weekend, so there
            is time to actually finish, and to learn the thing the sprint is themed around.
          </p>
        </div>
      </section>

      <section className="border-line border-t py-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">How a sprint works</h2>
          <p className="text-ink-muted mt-2 text-sm">
            Paced to fit around a full course load, not to compete with it.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PHASES.map((phase) => (
            <Card key={phase.number}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-accent text-2xl font-bold">{phase.number}</span>
                <span className="text-ink-muted text-xs">{phase.window}</span>
              </div>
              <h3 className="mt-3 font-semibold">{phase.title}</h3>
              <p className="text-ink-muted mt-1 text-sm">{phase.detail}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-line border-t py-16">
        <h2 className="text-2xl font-semibold tracking-tight">Why join a sprint?</h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-3">
          {REASONS.map((reason) => (
            <li key={reason.title} className="flex gap-3">
              <svg
                viewBox="0 0 20 20"
                aria-hidden
                className="text-accent mt-0.5 h-5 w-5 shrink-0 fill-current"
              >
                <path d="M10 1a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm4.2 6.7-5 5a1 1 0 0 1-1.4 0l-2.2-2.2a1 1 0 1 1 1.4-1.4l1.5 1.5 4.3-4.3a1 1 0 0 1 1.4 1.4Z" />
              </svg>
              <div>
                <h3 className="font-semibold">{reason.title}</h3>
                <p className="text-ink-muted mt-1 text-sm">{reason.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-line border-t py-16">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">All sprints</h2>
          {nextSprint && (
            <p className="text-ink-muted mt-2 text-sm">
              {nextSprint.status === 'active' ? 'Running now' : 'Up next'}: {nextSprint.title},
              starting {formatDate(nextSprint.startDate)}.
            </p>
          )}
        </div>

        {error ? (
          <ErrorState error={error} />
        ) : loading || !sprints ? (
          <LoadingState label="Loading sprints" />
        ) : (
          <SprintGrid sprints={sprints} />
        )}
      </section>
    </>
  )
}
