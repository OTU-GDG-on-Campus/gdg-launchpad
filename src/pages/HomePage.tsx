// Landing page: hero, what LaunchPad is for, featured projects, and a closing call to action.

import { Link } from 'react-router'
import { ProjectList } from '@/components/projects/ProjectList'
import { Button } from '@/components/ui/Button'
import { Wordmark } from '@/components/ui/Logo'
import { LoadingState } from '@/components/ui/PageState'
import { SITE } from '@/config/site'
import { useProjectFeed } from '@/hooks/useProjectFeed'

const VALUE_POINTS = [
  {
    title: 'Find inspiration',
    detail: 'See what people around you are building, and how they pulled it off.',
    icon: 'M10 2a6 6 0 0 0-3.5 10.9V15a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-2.1A6 6 0 0 0 10 2ZM8 17.5a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2H9a1 1 0 0 1-1-1Z',
  },
  {
    title: 'Share your projects',
    detail: 'Put your work in front of students and employers who are already looking.',
    icon: 'M10 2.5a1 1 0 0 1 .7.3l4 4a1 1 0 0 1-1.4 1.4L11 5.9V13a1 1 0 0 1-2 0V5.9L6.7 8.2a1 1 0 1 1-1.4-1.4l4-4a1 1 0 0 1 .7-.3ZM4 14a1 1 0 0 1 1 1v1h10v-1a1 1 0 1 1 2 0v1.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5V15a1 1 0 0 1 1-1Z',
  },
  {
    title: 'Contribute',
    detail: 'Jump into a project marked open to help and grow your GitHub alongside it.',
    icon: 'M7.8 4.7a1 1 0 0 1 0 1.4L3.9 10l3.9 3.9a1 1 0 1 1-1.4 1.4l-4.6-4.6a1 1 0 0 1 0-1.4l4.6-4.6a1 1 0 0 1 1.4 0Zm4.4 0a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4l-4.6 4.6a1 1 0 0 1-1.4-1.4l3.9-3.9-3.9-3.9a1 1 0 0 1 0-1.4Z',
  },
]

export function HomePage() {
  const { projects, loading, upvote } = useProjectFeed({ sort: 'top' })

  return (
    <>
      <section className="py-16 text-center sm:py-24">
        <Wordmark size="hero" />
        <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">{SITE.tagline}</h1>
        <p className="text-ink-muted mx-auto mt-4 max-w-xl text-sm">
          A showcase for Ontario Tech computer science students. Post your projects, team up for
          Semester Sprints, and get discovered.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/submit">
            <Button size="lg">Post your project</Button>
          </Link>
          <Link to="/projects">
            <Button size="lg" variant="secondary">
              Explore gallery
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-10 py-16 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">What is {SITE.name}?</h2>
          <p className="text-ink-muted mt-4 text-sm leading-relaxed">
            Good projects die quietly. Students lose momentum without feedback, or never post at all
            because they assume nobody will look. LaunchPad gives that work a home, in front of the
            people most likely to care about it.
          </p>
        </div>

        <ul className="space-y-6">
          {VALUE_POINTS.map((point) => (
            <li key={point.title} className="flex gap-4">
              <span className="bg-accent-soft text-accent mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                <svg viewBox="0 0 20 20" aria-hidden className="h-4.5 w-4.5 fill-current">
                  <path d={point.icon} />
                </svg>
              </span>
              <div>
                <h3 className="font-semibold">{point.title}</h3>
                <p className="text-ink-muted mt-1 text-sm">{point.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="py-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Featured projects</h2>
            <p className="text-ink-muted mt-1 text-sm">
              The most upvoted work from the Ontario Tech CS community.
            </p>
          </div>
          <Link to="/projects">
            <Button variant="secondary">View all projects</Button>
          </Link>
        </div>

        {loading ? (
          <LoadingState label="Loading projects" />
        ) : (
          <ProjectList projects={projects.slice(0, 6)} onUpvote={(id) => void upvote(id)} />
        )}
      </section>

      <section className="border-line bg-surface-raised mb-4 rounded-2xl border px-4 py-20 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Have something you have built?
        </h2>
        <p className="text-ink-muted mx-auto mt-4 max-w-lg text-sm">
          Do not let it sit on your local drive. Post it, get real feedback, and build your public
          footprint.
        </p>
        <div className="mt-8 flex justify-center">
          <Link to="/submit">
            <Button size="lg">Post your first project</Button>
          </Link>
        </div>
      </section>
    </>
  )
}
