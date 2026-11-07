// Semester Sprints: lavender bubble hero and interactive pathway, with a shared playful identity.

import { useRef } from 'react'
import { useScrollBubblePop } from '@/hooks/useScrollBubblePop'
import { SprintHeroBubbles } from '@/components/sprints/SprintHeroBubbles'
import { SprintJourney } from '@/components/sprints/SprintJourney'
import '@/styles/sprints.css'
import '@/styles/sprint-journey.css'

export function SprintsPage() {
  const root = useRef<HTMLDivElement>(null)
  useScrollBubblePop(root)
  return (
    <div className="sprint-event" ref={root}>
      <section className="sprint-wrap sprint-hero" aria-labelledby="sprint-title">
        <div className="sprint-hero-top">
          <p>
            OTU CS CLUB <span aria-hidden="true">×</span> GDG ON CAMPUS
          </p>
          <a href="#sprint-format">THE FORMAT</a>
        </div>
        <div className="sprint-hero-layout">
          <div className="sprint-hero-copy">
            <p className="sprint-eyebrow">SEMESTER SPRINTS / ONTARIO TECH</p>
            <h1 id="sprint-title">
              BUILD
              <br />
              SOMETHING
              <br />
              <span>REAL.</span>
            </h1>
            <p className="sprint-intro">Your team. Your ideas. Your next big first.</p>
            <p className="sprint-hero-description">
              A little less “one day.” A lot more day one. Turn an idea into a project worth
              showing, alongside people who want to build as much as you do.
            </p>
            <div className="sprint-hero-actions">
              <a href="#sprint-lineup" className="sprint-button sprint-button-primary">
                Explore the sprints
              </a>
              <a href="#sprint-format" className="sprint-text-link">
                How it works
              </a>
            </div>
          </div>
          <SprintHeroBubbles />
        </div>
        <dl className="sprint-facts">
          <div>
            <dt>THE FORMAT</dt>
            <dd>
              5-6 <span>weeks of building</span>
            </dd>
          </div>
          <div>
            <dt>THE CREW</dt>
            <dd>
              3-5 <span>people per team</span>
            </dd>
          </div>
          <div>
            <dt>THE OUTCOME</dt>
            <dd>
              1 <span>project to be proud of</span>
            </dd>
          </div>
          <div className="sprint-fact-note">
            <dt>LESS THEORY. MORE DOING.</dt>
            <dd>
              Your next project
              <br />
              starts with showing up.
            </dd>
          </div>
        </dl>
      </section>
      <SprintJourney />
    </div>
  )
}
