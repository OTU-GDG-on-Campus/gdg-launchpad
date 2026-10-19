// The discovery hero: the page's pitch and the global search trigger.

import { Kbd } from '@/components/ui/Kbd'
import { commandKeyLabel } from '@/lib/platform'

interface ProjectsHeroProps {
  onOpenSearch: () => void
}

export function ProjectsHero({ onOpenSearch }: ProjectsHeroProps) {
  return (
    <section className="discovery-hero border-line border-b">
      <div className="mx-auto max-w-6xl px-4 pt-14 pb-12 sm:px-6 sm:pt-20 sm:pb-14">
        <p className="text-accent-ink text-xs font-semibold tracking-[0.2em]">
          BUILT BY STUDENTS. POWERED BY IDEAS.
        </p>

        <h1 className="font-display mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Discover What&apos;s Being Built.
        </h1>

        <p className="text-ink-muted mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">
          Explore innovative projects from Ontario Tech students, discover emerging technologies,
          and connect with the builders shaping tomorrow.
        </p>

        <button
          type="button"
          onClick={onOpenSearch}
          className="border-line bg-surface shadow-card hover:border-ink-muted mt-8 flex h-12 w-full max-w-xl items-center gap-3 rounded-xl border px-4 text-left transition-colors"
        >
          <svg
            viewBox="0 0 20 20"
            aria-hidden
            className="text-ink-muted h-4 w-4 shrink-0 fill-current"
          >
            <path d="M8.5 3a5.5 5.5 0 1 0 3.4 9.8l3.4 3.4a1 1 0 0 0 1.4-1.4l-3.4-3.4A5.5 5.5 0 0 0 8.5 3Zm0 2a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z" />
          </svg>
          <span className="text-ink-muted truncate text-sm">
            Search projects, technologies, builders...
          </span>
          <Kbd className="ml-auto hidden sm:inline-flex">{commandKeyLabel()} K</Kbd>
        </button>
      </div>
    </section>
  )
}
