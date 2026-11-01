// Semester Sprints overview with a themed build journey, filterable sprint directory, and FAQs.

import { useState } from 'react'
import { Link } from 'react-router'
import { SprintGrid } from '@/components/sprints/SprintGrid'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageState'
import { isBackendConfigured, listSprints } from '@/lib/api/client'
import { useAsync } from '@/lib/useAsync'
import type { SprintStatus } from '@/types'

const PRIMARY_LINK =
  'bg-brand-500 text-on-brand hover:bg-brand-600 inline-flex min-h-12 items-center justify-center gap-3 rounded-lg px-6 py-3 text-sm font-semibold transition-colors'
const SECONDARY_LINK =
  'border-line bg-surface text-ink hover:border-brand-700 inline-flex min-h-12 items-center justify-center gap-3 rounded-lg border px-6 py-3 text-sm font-semibold transition-colors'

const PHASES = [
  {
    number: '01',
    label: 'Find your direction',
    title: 'Pick a small, good idea.',
    detail: 'Start with the theme. Choose one problem and a version you can realistically finish.',
  },
  {
    number: '02',
    label: 'Make it work',
    title: 'Build, learn, repeat.',
    detail:
      'Turn the idea into a working prototype. Use workshops and check-ins to work through the unfamiliar parts.',
  },
  {
    number: '03',
    label: 'Make it yours',
    title: 'Polish the experience.',
    detail:
      'Test the main flow, tidy the repository, and write a README that helps someone else get started.',
  },
  {
    number: '04',
    label: 'Share the process',
    title: 'Show what you made.',
    detail:
      'Prepare a short demo. Share what worked, what surprised you, and what you would try next.',
  },
]

const REASONS = [
  {
    title: 'A reason to start',
    detail:
      'A theme gives you a direction. A shared finish line helps you turn an idea into a manageable project.',
  },
  {
    title: 'People to learn alongside',
    detail:
      'Work through unfamiliar tools with other students and bring questions to workshops and check-ins.',
  },
  {
    title: 'Work you can explain',
    detail:
      'Leave with a clearer story about what you built, the choices you made, and the things you learned.',
  },
]

const FILTERS: { value: SprintStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All sprints' },
  { value: 'active', label: 'Running now' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
]
const FILTER_STYLES = {
  selected: 'border-brand-700 bg-brand-50 text-brand-700',
  idle: 'border-line bg-surface text-ink-muted hover:border-brand-700 hover:text-ink',
}

const QUESTIONS = [
  {
    question: 'How long is a sprint?',
    answer:
      'Sprints are short building seasons that fit alongside classes. The theme and schedule can vary, so use the dates on each sprint listing rather than a fixed weekly timetable.',
  },
  {
    question: 'Do I need to know the technology already?',
    answer:
      'You can explore the theme before committing to an idea. Read the sprint brief for the tools involved, and choose a small scope that leaves room to learn.',
  },
  {
    question: 'Can I register a team here?',
    answer: isBackendConfigured
      ? 'Team registration is not available on LaunchPad yet. Read the sprint brief for information about the event.'
      : 'Team registration is not available on LaunchPad yet. The sprint directory currently contains demonstration records, so the dates and statuses are previews, not confirmed event announcements.',
  },
  {
    question: 'Will I get a certificate?',
    answer:
      'Certificates and sprint montage features are planned, but are not available on the platform yet. Check the confirmed event details for any participation requirements or recognition.',
  },
]

export function SprintsPage() {
  const { data: sprints, loading, error } = useAsync(() => listSprints(), 'sprints')
  const [filter, setFilter] = useState<SprintStatus | 'all'>('all')
  const filteredSprints = sprints?.filter((sprint) => filter === 'all' || sprint.status === filter)

  return (
    <div className="space-y-16 pb-6 sm:space-y-20">
      <section
        aria-labelledby="sprints-title"
        className="discovery-hero border-line overflow-hidden rounded-2xl border"
      >
        <div className="grid gap-10 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-brand-700 mb-5 font-mono text-xs tracking-widest uppercase">
              Semester Sprints
            </p>
            <h1
              id="sprints-title"
              className="max-w-2xl text-4xl leading-tight font-bold tracking-tight sm:text-6xl"
            >
              A shared theme.
              <br />
              Your next <span className="text-brand-700">big little project.</span>
            </h1>
            <p className="text-ink-soft mt-6 max-w-xl text-base leading-relaxed sm:text-lg">
              Make time to build something beyond the assignment. Explore a new technology, work
              alongside Ontario Tech students, and turn an idea into something you can demo.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#sprint-directory" className={PRIMARY_LINK}>
                Explore the sprints <span aria-hidden="true">&#8595;</span>
              </a>
              <Link to="/projects" className={SECONDARY_LINK}>
                Explore student projects <span aria-hidden="true">&#8599;</span>
              </Link>
            </div>
          </div>
          <aside className="border-line bg-surface rounded-xl border p-6 sm:p-8">
            <p className="text-flare font-mono text-xs tracking-widest uppercase">
              The sprint mindset
            </p>
            <p className="mt-5 text-2xl leading-snug font-semibold tracking-tight">
              Start small.
              <br />
              Learn out loud.
              <br />
              <span className="text-brand-700">Finish with a story.</span>
            </p>
            <div className="border-line text-ink-muted mt-6 border-t pt-5 text-sm leading-relaxed">
              Think of it as a hackathon with breathing room: time to ask questions, try things, and
              make the project your own.
            </div>
          </aside>
        </div>
        <div className="border-line bg-surface/80 flex flex-wrap gap-x-8 gap-y-2 border-t px-6 py-4 font-mono text-xs sm:px-10">
          <span>Themed builds</span>
          <span>Workshops and check-ins</span>
          <span>Student-led learning</span>
        </div>
      </section>

      <section aria-labelledby="journey-title">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-flare mb-3 font-mono text-xs tracking-widest uppercase">
              From idea to demo
            </p>
            <h2 id="journey-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
              A little structure. A lot of possibility.
            </h2>
          </div>
          <p className="text-ink-muted max-w-sm text-sm leading-relaxed">
            A typical build journey. The pace and activities depend on each sprint.
          </p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PHASES.map((phase) => (
            <li key={phase.number} className="border-line bg-surface rounded-xl border p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="text-brand-700 font-mono text-2xl">{phase.number}</span>
                <span aria-hidden="true" className="text-ink-muted">
                  &#8594;
                </span>
              </div>
              <p className="text-flare mt-6 font-mono text-[10px] tracking-widest uppercase">
                {phase.label}
              </p>
              <h3 className="mt-2 text-lg font-semibold">{phase.title}</h3>
              <p className="text-ink-muted mt-3 text-sm leading-relaxed">{phase.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="reasons-title"
        className="border-line grid gap-8 border-y py-10 lg:grid-cols-[1fr_2fr] lg:gap-16"
      >
        <h2 id="reasons-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
          More than another
          <br className="hidden lg:block" /> repository.
        </h2>
        <div className="grid gap-7 sm:grid-cols-3">
          {REASONS.map((reason) => (
            <div key={reason.title}>
              <h3 className="font-semibold">{reason.title}</h3>
              <p className="text-ink-muted mt-3 text-sm leading-relaxed">{reason.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="sprint-directory" aria-labelledby="directory-title" className="scroll-mt-24">
        <p className="text-flare mb-3 font-mono text-xs tracking-widest uppercase">
          Find your next challenge
        </p>
        <h2 id="directory-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
          The sprint directory.
        </h2>
        <p className="border-line bg-surface-raised text-ink-soft mt-5 rounded-lg border px-4 py-3 text-sm leading-relaxed">
          {isBackendConfigured ? (
            'Explore the sprint briefs below. Team registration is not available on LaunchPad yet.'
          ) : (
            <>
              <span className="font-semibold">Preview directory.</span> These are sample sprint
              listings. Event dates and availability are not confirmed, and team registration is not
              open here yet.
            </>
          )}
        </p>
        <div
          role="group"
          aria-label="Filter sprints by status"
          className="my-6 flex flex-wrap gap-2"
        >
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={filter === option.value}
              onClick={() => setFilter(option.value)}
              className={`min-h-10 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${FILTER_STYLES[filter === option.value ? 'selected' : 'idle']}`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {error ? (
          <ErrorState error={error} />
        ) : loading || !filteredSprints ? (
          <LoadingState label="Loading sprints" />
        ) : filteredSprints.length === 0 ? (
          <EmptyState
            title={filter === 'all' ? 'No sprints listed yet' : 'No sprints in this category'}
            hint={
              filter === 'all'
                ? 'Check back when the sprint calendar is available.'
                : 'Choose another status to explore the other sprints.'
            }
          />
        ) : (
          <>
            <p role="status" className="text-ink-muted mb-4 text-sm">
              {filteredSprints.length} {filteredSprints.length === 1 ? 'sprint' : 'sprints'} in this
              view
            </p>
            <SprintGrid sprints={filteredSprints} />
          </>
        )}
      </section>

      <section
        aria-labelledby="sprint-questions-title"
        className="grid gap-7 lg:grid-cols-[1fr_2fr] lg:gap-16"
      >
        <div>
          <p className="text-flare mb-3 font-mono text-xs tracking-widest uppercase">
            Before you begin
          </p>
          <h2 id="sprint-questions-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
            A few things to know.
          </h2>
        </div>
        <div className="divide-line border-line divide-y border-y">
          {QUESTIONS.map((item) => (
            <details key={item.question} className="py-5">
              <summary className="marker:text-brand-700 cursor-pointer pr-3 font-semibold">
                {item.question}
              </summary>
              <p className="text-ink-muted mt-3 text-sm leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="sprint-cta-title"
        className="border-line bg-surface-raised flex flex-col items-start justify-between gap-6 rounded-2xl border p-6 sm:p-10 md:flex-row md:items-center"
      >
        <div className="max-w-xl">
          <h2 id="sprint-cta-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
            Curious? Start with what is already being built.
          </h2>
          <p className="text-ink-muted mt-4 text-sm leading-relaxed">
            Explore the gallery for inspiration, or find a student project that could use another
            pair of hands.
          </p>
        </div>
        <Link to="/projects?contrib=1" className={SECONDARY_LINK}>
          Find a project to help <span aria-hidden="true">&#8599;</span>
        </Link>
      </section>
    </div>
  )
}
