// A winding bubble pathway through build stages, sample sprint briefs, and practical questions.

import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { SprintBubble } from './SprintBubble'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageState'
import { listSprints } from '@/lib/api/client'
import { formatDateRange } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'

const STAGES = [
  {
    title: 'Find your people.',
    label: 'THE FIRST CONNECTION',
    summary: 'A good idea gets better with the right people around it.',
    detail:
      'Bring a spark of an idea, or join a team that needs your perspective. Teams of 3 to 5 bring different strengths together: design, code, research, and a little curiosity.',
  },
  {
    title: 'Make it happen.',
    label: 'THE FIRST PROTOTYPE',
    summary: 'Go from a conversation to something you can actually try.',
    detail:
      'Break the idea into small pieces. Build a first version, learn from the parts that surprise you, and use workshops and check-ins to keep moving.',
  },
  {
    title: 'Play. Test. Refine.',
    label: 'THE LITTLE BREAKTHROUGHS',
    summary: 'The rough edges are where the interesting work begins.',
    detail:
      'Let someone use what you made. Listen, experiment, and keep the changes that make it better. Your first version is just the starting point.',
  },
  {
    title: 'Give it a world.',
    label: 'THE MOMENT YOU SHIP',
    summary: 'A real demo. Your name on it. Something worth sharing.',
    detail:
      'Show your project to the community, tell the story behind it, and share the finished work on LaunchPad. Leave with a project you can keep building.',
  },
]
const QUESTIONS = [
  {
    title: 'New to building?',
    summary: 'Curiosity is a good place to start.',
    answer:
      'You do not need a polished portfolio. Pick a brief that interests you and contribute what you can. Design, research, testing, and presenting matter just as much as code.',
  },
  {
    title: 'Coming solo?',
    summary: 'Your future teammates might be, too.',
    answer:
      'You can come with an idea or look for people with complementary skills. Team formation details will be shared with each sprint; the event format is designed for teams of 3 to 5.',
  },
  {
    title: 'What about classes?',
    summary: 'A build season with room for real life.',
    answer:
      'Work happens in stages alongside your courses. The general format is 5 to 6 weeks; individual sprint schedules and dates will be confirmed separately.',
  },
  {
    title: 'Ready to take part?',
    summary: 'Start with a brief that sparks something.',
    answer:
      'Explore the sprint briefs along the pathway. Registration details and confirmed dates will be published when available. Posting projects requires a verified Ontario Tech student account.',
  },
]

export function SprintJourney() {
  const { data: sprints, loading, error } = useAsync(listSprints, 'sprints')
  const pathway = useRef<HTMLDivElement>(null)
  const [curve, setCurve] = useState<{
    height: number
    segments: { id: string; d: string }[]
  }>({
    height: 2520,
    segments: [],
  })
  useLayoutEffect(() => {
    const element = pathway.current
    if (!element) return
    function measure() {
      if (!element) return
      const bounds = element.getBoundingClientRect()
      const points = Array.from(
        element.querySelectorAll<HTMLElement>('.sprint-path-stops > li [data-scroll-bubble]'),
      ).map((bubble) => {
        const rect = bubble.getBoundingClientRect()
        return {
          id: bubble.dataset.scrollId ?? '',
          x: ((rect.left + rect.width / 2 - bounds.left) / bounds.width) * 1000,
          y: rect.top + rect.height / 2 - bounds.top,
        }
      })
      const first = points[0]
      if (!first) return
      const segments = points.map((point, index) => {
        const previous = points[index - 1] ?? { x: point.x, y: 0 }
        const midpoint = (previous.y + point.y) / 2
        return {
          id: point.id,
          d: `M ${previous.x} ${previous.y} C ${previous.x} ${midpoint}, ${point.x} ${midpoint}, ${point.x} ${point.y}`,
        }
      })
      setCurve({ height: bounds.height, segments })
    }
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    element.querySelectorAll('.sprint-bubble-stop').forEach((stop) => observer.observe(stop))
    measure()
    return () => observer.disconnect()
  }, [sprints])
  return (
    <div className="sprint-bubble-world">
      <section
        id="sprint-format"
        className="sprint-wrap sprint-journey"
        aria-labelledby="journey-title"
      >
        <header className="sprint-journey-heading">
          <p className="sprint-eyebrow">A LITTLE CURIOSITY GOES A LONG WAY</p>
          <h2 id="journey-title">
            Follow the spark.
            <br />
            <span>See where it takes you.</span>
          </h2>
          <p>
            Every build has a story. Scroll through yours.
            <br />
            Tap a bubble to explore, or give it a gentle nudge.
          </p>
        </header>
        <div className="sprint-pathway" ref={pathway}>
          <svg
            className="sprint-path-line"
            viewBox={`0 0 1000 ${curve.height}`}
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            {curve.segments.map((segment) => (
              <g key={segment.id} data-link-to={segment.id} className="sprint-link-segment">
                <path
                  d={segment.d}
                  pathLength="1"
                  className="sprint-link-trace"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d={segment.d}
                  pathLength="1"
                  className="sprint-link-draw"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d={segment.d}
                  pathLength="1"
                  className="sprint-link-spark"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ))}
          </svg>
          <ol className="sprint-path-stops">
            {STAGES.map((stage, index) => (
              <li key={stage.title}>
                <SprintBubble
                  number={String(index + 1)}
                  label={stage.label}
                  title={stage.title}
                  summary={stage.summary}
                >
                  <p>{stage.detail}</p>
                  {index === 3 && <Link to="/projects">Explore student projects</Link>}
                </SprintBubble>
              </li>
            ))}
            {sprints?.map((sprint, index) => (
              <li key={sprint.id} id={index === 0 ? 'sprint-lineup' : undefined}>
                <SprintBubble
                  number={String(index + 5)}
                  label={`SPRINT BRIEF / ${sprint.theme}`}
                  title={sprint.title}
                  summary={sprint.description}
                >
                  <p>{formatDateRange(sprint.startDate, sprint.endDate)}</p>
                  <p className="sprint-bubble-preview">
                    Preview brief. Dates and registration are not yet confirmed.
                  </p>
                  <Link to={`/sprints/${sprint.slug}`}>Explore this sprint</Link>
                </SprintBubble>
              </li>
            ))}
          </ol>
        </div>
        {error ? (
          <ErrorState error={error} />
        ) : loading ? (
          <LoadingState label="Loading sprint bubbles" />
        ) : sprints?.length === 0 ? (
          <EmptyState title="More sparks on the way" hint="New sprint briefs will appear here." />
        ) : null}
      </section>
      <section className="sprint-wrap sprint-bubble-questions" aria-labelledby="questions-title">
        <header>
          <p className="sprint-eyebrow">A FEW THINGS YOU MIGHT BE WONDERING</p>
          <h2 id="questions-title">
            A little clarity.
            <br />
            <span>Then, a leap.</span>
          </h2>
        </header>
        <div className="sprint-question-bubbles">
          {QUESTIONS.map((question) => (
            <SprintBubble
              key={question.title}
              number="?"
              label="GOOD TO KNOW"
              title={question.title}
              summary={question.summary}
              small
              persistent
            >
              <p>{question.answer}</p>
            </SprintBubble>
          ))}
        </div>
      </section>
      <section className="sprint-wrap sprint-bubble-finale" aria-labelledby="bubble-finale-title">
        <span className="sprint-finale-pearl" aria-hidden="true" />
        <p className="sprint-eyebrow">YOUR NEXT CHAPTER HAS A FIRST COMMIT.</p>
        <h2 id="bubble-finale-title">
          Something real.
          <br />
          <span>Something yours.</span>
        </h2>
        <a href="#sprint-format" className="sprint-button sprint-button-primary">
          Back to the beginning
        </a>
        <p className="sprint-finale-credit">OTU CS CLUB × GDG ON CAMPUS</p>
      </section>
    </div>
  )
}
