// Accessible inspectable bubble with bounded pointer movement and a spring-back interaction.

import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { useSpringBubble } from '@/hooks/useSpringBubble'

interface SprintBubbleProps {
  number: string
  label: string
  title: string
  summary: string
  children: ReactNode
  small?: boolean
  persistent?: boolean
}

export function SprintBubble({
  number,
  label,
  title,
  summary,
  children,
  small = false,
  persistent = false,
}: SprintBubbleProps) {
  const detailsId = useId()
  const [open, setOpen] = useState(false)
  const { offset, dragging, handlers } = useSpringBubble(() => setOpen((current) => !current))
  return (
    <div
      className={cn(
        'sprint-bubble-stop',
        small && 'sprint-bubble-stop-small',
        open && 'is-inspected',
      )}
    >
      <div className="sprint-bubble-dock">
        <div
          className="sprint-bubble-scroll"
          data-scroll-bubble={persistent ? undefined : true}
          data-scroll-static={persistent ? true : undefined}
          data-scroll-id={detailsId}
        >
          <div className="sprint-bubble-pop-visual">
            <div
              className={cn('sprint-bubble-motion', dragging && 'is-dragging')}
              style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
            >
              <button
                type="button"
                className="sprint-bubble"
                aria-expanded={open}
                aria-controls={detailsId}
                aria-label={`${open ? 'Close' : 'Inspect'} ${title}`}
                {...handlers}
              >
                <span className="sprint-bubble-aura" aria-hidden="true" />
                <span className="sprint-bubble-gloss" aria-hidden="true" />
                <span className="sprint-bubble-number">{number}</span>
                <span className="sprint-bubble-caption">{open ? 'EXPLORING' : 'EXPLORE'}</span>
              </button>
            </div>
          </div>
        </div>
        <span className="sprint-bubble-hint">{open ? 'Tap to close' : 'Tap to inspect'}</span>
      </div>
      <div className="sprint-bubble-copy">
        <p className="sprint-eyebrow">{label}</p>
        <h3>{title}</h3>
        <p className="sprint-bubble-summary">{summary}</p>
        <div id={detailsId} className="sprint-bubble-reveal" hidden={!open}>
          {children}
        </div>
      </div>
    </div>
  )
}
