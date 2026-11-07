// Original orbital sculpture for the sprint event, drawn as scalable vector artwork.

import { useId } from 'react'

export function SprintOrbit() {
  const id = useId().replace(/:/g, '')
  return (
    <figure className="sprint-art">
      <div className="sprint-art-caption">
        <span>THE NEXT THING STARTS HERE</span>
        <span>01 / IN MOTION</span>
      </div>
      <svg viewBox="0 0 560 540" fill="none" aria-hidden="true" className="sprint-orbit">
        <defs>
          <linearGradient
            id={`${id}-ring`}
            x1="80"
            y1="70"
            x2="450"
            y2="470"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="var(--event-shine)" />
            <stop offset=".28" stopColor="var(--event-purple)" />
            <stop offset=".58" stopColor="var(--event-deep)" />
            <stop offset=".8" stopColor="var(--event-purple)" />
            <stop offset="1" stopColor="var(--event-shine)" />
          </linearGradient>
          <radialGradient id={`${id}-core`} cx=".3" cy=".2" r=".85">
            <stop stopColor="var(--event-shine)" />
            <stop offset=".3" stopColor="var(--event-purple)" />
            <stop offset="1" stopColor="var(--event-deep)" />
          </radialGradient>
          <radialGradient id={`${id}-glow`}>
            <stop stopColor="var(--event-purple)" stopOpacity=".25" />
            <stop offset="1" stopColor="var(--event-purple)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="280" cy="270" r="250" fill={`url(#${id}-glow)`} />
        <circle cx="280" cy="270" r="218" stroke="var(--event-line)" strokeDasharray="3 9" />
        <path d="M280 27V54M280 486V513M37 270H64M496 270H523" stroke="var(--event-muted)" />
        <g className="sprint-orbit-form">
          <ellipse
            cx="280"
            cy="270"
            rx="185"
            ry="86"
            transform="rotate(-36 280 270)"
            stroke={`url(#${id}-ring)`}
            strokeWidth="31"
          />
          <ellipse
            cx="280"
            cy="270"
            rx="185"
            ry="86"
            transform="rotate(36 280 270)"
            stroke={`url(#${id}-ring)`}
            strokeWidth="31"
          />
          <circle cx="280" cy="270" r="70" fill={`url(#${id}-core)`} />
          <ellipse
            cx="280"
            cy="270"
            rx="185"
            ry="86"
            transform="rotate(90 280 270)"
            stroke={`url(#${id}-ring)`}
            strokeWidth="24"
          />
          <path
            d="M129 351C209 383 365 329 434 197"
            stroke="var(--event-shine)"
            strokeOpacity=".75"
            strokeWidth="2"
          />
        </g>
        <circle cx="431" cy="112" r="12" fill="var(--event-lime)" />
        <circle cx="97" cy="388" r="5" fill="var(--event-purple)" />
        <path d="M420 426h24m-12-12v24" stroke="var(--event-lime)" strokeWidth="2" />
      </svg>
      <figcaption className="sprint-art-footer">
        <span>IDEA / ITERATE / SHIP</span>
        <span className="sprint-signal">
          <i /> POSSIBILITIES, IN ORBIT
        </span>
      </figcaption>
    </figure>
  )
}
