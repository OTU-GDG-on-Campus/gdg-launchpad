// Three playful lavender bubbles introduce the same interaction used along the sprint pathway.

import { useId, useState } from 'react'
import { useSpringBubble } from '@/hooks/useSpringBubble'
import { cn } from '@/lib/cn'

const SPARKS = [
  {
    number: '1',
    title: 'It starts with a spark.',
    detail: 'One idea. A few curious people. A whole world of possibilities.',
    size: 'main',
  },
  {
    number: '2',
    title: 'Give the idea a little room.',
    detail: 'Try something. Change your mind. Make a small breakthrough.',
    size: 'middle',
  },
  {
    number: '3',
    title: 'Make it something real.',
    detail: 'Build it together, share it with the community, and see what comes next.',
    size: 'little',
  },
] as const

function HeroPearl({
  index,
  selected,
  controls,
  onSelect,
}: {
  index: number
  selected: boolean
  controls: string
  onSelect: () => void
}) {
  const spark = SPARKS[index]
  const { offset, dragging, handlers } = useSpringBubble(onSelect)
  return (
    <div
      className={cn(
        'sprint-hero-pearl-slot',
        `sprint-hero-pearl-${spark.size}`,
        selected && 'is-selected',
      )}
    >
      <div className="sprint-bubble-scroll" data-scroll-bubble>
        <div className="sprint-bubble-pop-visual">
          <div
            className={cn('sprint-bubble-motion', dragging && 'is-dragging')}
            style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
          >
            <button
              type="button"
              className="sprint-bubble"
              aria-label={`Explore spark ${spark.number}: ${spark.title}`}
              aria-pressed={selected}
              aria-controls={controls}
              {...handlers}
            >
              <span className="sprint-bubble-aura" aria-hidden="true" />
              <span className="sprint-bubble-gloss" aria-hidden="true" />
              <span className="sprint-bubble-number">{spark.number}</span>
              <span className="sprint-bubble-caption">
                {selected ? 'YOUR SPARK' : 'GIVE IT A NUDGE'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SprintHeroBubbles() {
  const [selected, setSelected] = useState(0)
  const descriptionId = useId()
  return (
    <div className="sprint-hero-bubbles" aria-label="Explore three playful sparks">
      <span className="sprint-hero-dust sprint-hero-dust-one" aria-hidden="true" />
      <span className="sprint-hero-dust sprint-hero-dust-two" aria-hidden="true" />
      {SPARKS.map((spark, index) => (
        <HeroPearl
          key={spark.number}
          index={index}
          selected={selected === index}
          controls={descriptionId}
          onSelect={() => setSelected(index)}
        />
      ))}
      <div
        id={descriptionId}
        className="sprint-hero-spark-copy"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="sprint-eyebrow">A LITTLE PLAY. A LOT OF POSSIBILITY.</p>
        <p className="sprint-hero-spark-title">{SPARKS[selected].title}</p>
        <p>{SPARKS[selected].detail}</p>
      </div>
    </div>
  )
}
