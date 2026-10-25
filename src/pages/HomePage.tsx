// Landing page: gridded hero, featured projects, contributors, submission prompt, and About.

import { useState } from 'react'
import { Link } from 'react-router'
import { SITE } from '@/config/site'
import { allowedDomainsLabel } from '@/lib/auth/domain'
import { Avatar } from '@/components/ui/Avatar'
import { listContributors } from '@/lib/api/client'
import { useAsync } from '@/lib/useAsync'
import { LandingProjectCard } from '@/components/projects/LandingProjectCard'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageState'
import { useProjectFeed } from '@/hooks/useProjectFeed'

const PRIMARY_LINK =
  'bg-brand-500 text-on-brand hover:bg-brand-600 inline-flex min-h-12 items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold transition-colors'
const SECONDARY_LINK =
  'border-line bg-surface text-ink hover:border-brand-700 inline-flex min-h-12 items-center justify-center rounded-lg border px-6 py-3 text-sm font-semibold transition-colors'

export function HomePage() {
  const { projects, totalCount, loading, error, upvote } = useProjectFeed({
    sort: 'top',
    perPage: 6,
  })
  const contributors = useAsync(listContributors, 'landing-contributors')
  const [voteError, setVoteError] = useState<string | null>(null)
  const featuredProjects = projects.slice(0, 4)
  const otherProjects = projects.slice(4)
  const openCount = projects.filter((project) => project.openToContributions).length
  const categoryCount = new Set(projects.map((project) => project.category)).size
  const statistics = [
    { label: 'Projects in the gallery', value: totalCount },
    { label: 'Open in this selection', value: openCount },
    { label: 'Categories in this selection', value: categoryCount },
  ]

  async function handleUpvote(projectId: string) {
    setVoteError(null)
    try {
      await upvote(projectId)
    } catch (cause) {
      setVoteError(
        cause instanceof Error ? cause.message : 'Unable to update your upvote. Try again.',
      )
    }
  }

  return (
    <div>
      <section
        aria-labelledby="landing-title"
        className="landing-grid bg-surface-muted relative flex min-h-140 flex-col items-center justify-center px-4 py-20 text-center sm:px-6 sm:py-24"
      >
        <p className="text-ink-muted mb-6 font-mono text-xs tracking-widest uppercase">
          Built by students. Made to be shared.
        </p>
        <h1
          id="landing-title"
          className="mx-auto max-w-290 text-5xl leading-[0.98] font-extrabold tracking-[-0.045em] sm:text-7xl lg:text-[96px]"
        >
          Where <span className="text-brand-700">Ontario Tech's</span>
          <br /> students ship<span className="text-flare">.</span>
        </h1>
        <p className="text-ink-muted mx-auto mt-7 max-w-xl text-base leading-relaxed sm:text-lg">
          Discover projects built by students, contribute to the ones you love, and build something
          of your own.
        </p>
        <div className="mt-9 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <Link to="/projects" className={PRIMARY_LINK}>
            Explore Projects
          </Link>
          <Link to="/submit" className={SECONDARY_LINK}>
            Launch Your Project
          </Link>
        </div>
        <dl className="border-line mt-12 grid w-full max-w-2xl grid-cols-3 border-t pt-6">
          {statistics.map((statistic) => (
            <div key={statistic.label} className="px-2 sm:px-5">
              <dt className="text-ink-muted text-[10px] leading-relaxed sm:text-xs">
                {statistic.label}
              </dt>
              <dd className="mt-2 font-mono text-2xl font-bold sm:text-3xl">
                {loading || error ? '-' : statistic.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="border-line border-t">
        <div className="mx-auto max-w-335 px-6 pt-12 pb-16 sm:px-11 sm:pb-24">
          <section aria-labelledby="featured-title">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-flare mb-2 font-mono text-xs tracking-widest uppercase">
                  Discover what's being built
                </p>
                <h2 id="featured-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Featured projects
                </h2>
              </div>
              <p className="text-ink-muted max-w-sm text-sm leading-relaxed">
                The most upvoted projects from the student community.
              </p>
            </div>
            {voteError && (
              <p role="alert" className="border-line bg-surface mb-5 rounded-lg border p-4 text-sm">
                {voteError}
              </p>
            )}
            {error ? (
              <ErrorState error={error} />
            ) : loading ? (
              <LoadingState label="Loading projects" />
            ) : projects.length === 0 ? (
              <EmptyState
                title="No projects yet"
                hint="Be the first to share what you are building."
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {featuredProjects.map((project) => (
                  <LandingProjectCard
                    key={project.id}
                    project={project}
                    variant="standard"
                    onUpvote={(id) => void handleUpvote(id)}
                  />
                ))}
              </div>
            )}
          </section>

          {!loading && !error && otherProjects.length > 0 && (
            <section aria-labelledby="other-projects-title" className="mt-12">
              <h2
                id="other-projects-title"
                className="text-ink-muted mb-5 font-mono text-xs tracking-widest uppercase"
              >
                More from the community
              </h2>
              <div className="grid gap-3">
                {otherProjects.map((project) => (
                  <LandingProjectCard
                    key={project.id}
                    project={project}
                    variant="compact"
                    onUpvote={(id) => void handleUpvote(id)}
                  />
                ))}
              </div>
            </section>
          )}

          <Link
            to="/projects"
            className="border-line bg-surface hover:border-brand-700 mt-7 flex min-h-14 items-center justify-center gap-2 rounded-xl border px-4 py-4 text-sm font-semibold transition-colors"
          >
            Explore the project gallery
          </Link>

          <section aria-labelledby="contributors-title" className="mt-16">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-brand-700 font-mono text-xs tracking-widest uppercase">
                  Built together
                </p>
                <h2 id="contributors-title" className="mt-2 text-3xl font-extrabold tracking-tight">
                  Contributors
                </h2>
              </div>
              <Link to="/contributors" className="text-brand-700 text-sm font-bold">
                View all contributors
              </Link>
            </div>
            {contributors.error ? (
              <ErrorState error={contributors.error} />
            ) : contributors.loading ? (
              <LoadingState label="Loading contributors" />
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {contributors.data?.slice(0, 6).map((person) => (
                  <li
                    key={person.id}
                    className="border-line bg-surface flex items-center gap-3 rounded-xl border p-4"
                  >
                    <Avatar name={person.name} src={person.avatarUrl} />
                    <div>
                      <p className="text-sm font-bold">{person.name}</p>
                      <p className="text-ink-muted mt-1 font-mono text-[10px]">
                        {person.projectCount} {person.projectCount === 1 ? 'project' : 'projects'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section
            aria-labelledby="submit-title"
            className="landing-grid bg-surface border-ink-muted mt-16 flex flex-col items-start justify-between gap-6 rounded-xl border border-dashed px-6 py-10 sm:px-10 md:flex-row md:items-center"
          >
            <div>
              <h2
                id="submit-title"
                className="max-w-xl text-3xl leading-tight font-bold tracking-tight"
              >
                Built something at <span className="text-brand-700">Ontario Tech</span>?
              </h2>
              <p className="text-ink-muted mt-3 max-w-lg text-sm leading-relaxed">
                Give your project a home. Share your work, find collaborators, and inspire the next
                student to start building.
              </p>
            </div>
            <Link to="/submit" className={PRIMARY_LINK}>
              Post your project
            </Link>
          </section>
          <section
            id="about"
            aria-labelledby="about-title"
            className="border-line mt-16 scroll-mt-32 border-t pt-12 sm:pt-16"
          >
            <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
              <div>
                <h2 id="about-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
                  What is {SITE.shortName}?
                </h2>
                <p className="text-ink-muted mt-5 max-w-2xl text-sm leading-relaxed sm:text-base">
                  Good projects deserve an audience. LaunchPad gives Ontario Tech students a home
                  for the things they build, with feedback from peers, opportunities to collaborate,
                  and work they can share with employers. Browse what others are building, learn how
                  they made it, or find a project that could use your help.
                </p>
                <p className="text-ink-muted mt-4 max-w-2xl text-sm leading-relaxed sm:text-base">
                  There are only upvotes here. Share your work, encourage other builders, and help
                  the projects you love reach more people.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">How it works</h3>
                <ul className="text-ink-muted mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed">
                  <li>Anyone can browse. No account needed.</li>
                  <li>
                    Posting and upvoting require a verified Ontario Tech email (
                    {allowedDomainsLabel()}) and a completed registration.
                  </li>
                  <li>A coordinator reviews every submission before it goes live.</li>
                </ul>
                <p className="text-ink-muted mt-6 text-sm leading-relaxed">
                  Built and maintained by {SITE.organization}.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
