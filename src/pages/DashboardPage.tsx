// Student dashboard following Dhruv's layout, with genuine local viewing history and a profile checklist.

import { useState } from 'react'
import { Link } from 'react-router'
import { AccountProjectRow } from '@/components/account/AccountProjectRow'
import { ErrorState, LoadingState } from '@/components/ui/PageState'
import { clearRecentlyViewed, getAccountWorkspace } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/useAuth'
import { useAsync } from '@/lib/useAsync'

export function DashboardPage() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const [clearing, setClearing] = useState(false)
  const [clearError, setClearError] = useState<string | null>(null)
  const workspace = useAsync(
    () => getAccountWorkspace(user?.id ?? ''),
    `${user?.id ?? 'signed-out'}|${refresh}`,
  )
  if (workspace.error) return <ErrorState error={workspace.error} />
  if (workspace.loading || !workspace.data || !user)
    return <LoadingState label="Loading dashboard" />
  const { profile, projects, recentlyViewed } = workspace.data
  const published = projects.filter((project) => project.status === 'approved').length
  const statistics = [
    { label: 'Projects', value: projects.length, shape: 'M3 5h5l2 2h7v9H3Z' },
    {
      label: 'Total upvotes',
      value: projects.reduce((sum, project) => sum + project.upvoteCount, 0),
      shape: 'm5 10 5-6 5 6h-3v6H8v-6Z',
    },
    {
      label: 'Recently viewed',
      value: recentlyViewed.length,
      shape: 'M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6Zm8-2v4',
    },
  ]
  const checklist = [
    { label: 'Write your About me', done: Boolean(profile.about.trim()) },
    { label: 'Add your program and year', done: Boolean(profile.program && profile.year) },
    { label: 'Pin a project you are proud of', done: profile.pinnedProjectIds.length > 0 },
  ]

  async function clearHistory() {
    if (clearing || !user) return
    setClearing(true)
    setClearError(null)
    try {
      await clearRecentlyViewed(user.id)
      setRefresh((value) => value + 1)
    } catch {
      setClearError('Could not clear viewing history. Check browser storage settings.')
    } finally {
      setClearing(false)
    }
  }

  return (
    <div>
      <header className="border-line bg-surface border-b">
        <div className="mx-auto max-w-335 px-6 py-10 sm:px-11">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-brand-700 flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase">
                <span aria-hidden="true" className="bg-flare h-1.5 w-1.5 rounded-xs" />
                Student dashboard
              </p>
              <h1 className="mt-3 text-3xl leading-tight font-extrabold tracking-[-0.035em] sm:text-[38px]">
                Welcome back, {profile.name.split(' ')[0]}
              </h1>
              <p className="text-ink-soft mt-3 max-w-[48ch] text-[15.5px] leading-relaxed">
                Your projects, profile, and activity in one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/submit"
                className="bg-brand-500 text-on-brand hover:bg-brand-600 rounded-lg px-5 py-3 text-sm font-bold"
              >
                New project
              </Link>
              <Link
                to="/projects"
                className="border-line bg-surface hover:border-brand-700 rounded-lg border px-5 py-3 text-sm font-bold"
              >
                Browse projects
              </Link>
            </div>
          </div>
          <dl className="mt-8 grid gap-3.5 sm:grid-cols-3">
            {statistics.map((stat) => (
              <div
                key={stat.label}
                className="border-line bg-surface flex items-center gap-3.5 rounded-xl border px-5 py-4.5 shadow-xs"
              >
                <span className="border-brand-700/10 bg-brand-50 text-brand-700 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="h-5 w-5"
                  >
                    <path d={stat.shape} />
                  </svg>
                </span>
                <div className="flex flex-col-reverse gap-1.5">
                  <dt className="text-ink-muted font-mono text-[11px] tracking-widest uppercase">
                    {stat.label}
                  </dt>
                  <dd className="text-3xl leading-none font-extrabold tabular-nums">
                    {stat.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </header>
      <div className="mx-auto max-w-335 px-6 py-9 sm:px-11 sm:pb-24">
        <p className="text-ink-muted mb-7 text-xs leading-relaxed">
          Project lists use sample data. Profile previews and viewing history stay on this browser.
        </p>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="space-y-8">
            <section aria-labelledby="my-projects-title">
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h2 id="my-projects-title" className="text-xl font-extrabold tracking-tight">
                  My Projects
                </h2>
                <span className="text-ink-muted font-mono text-[11px]">
                  {published} published · {projects.length - published} in review
                </span>
              </div>
              <div className="border-line bg-surface overflow-hidden rounded-xl border shadow-xs">
                {projects.length ? (
                  projects.map((project) => (
                    <AccountProjectRow key={project.id} project={project} />
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="font-bold">No projects yet</p>
                    <p className="text-ink-muted mt-2 text-sm">
                      Your projects will appear here after you submit one.
                    </p>
                    <Link
                      to="/submit"
                      className="text-brand-700 mt-4 inline-block text-sm font-bold"
                    >
                      Post a project
                    </Link>
                  </div>
                )}
              </div>
            </section>
            <section aria-labelledby="checklist-title">
              <h2 id="checklist-title" className="mb-4 text-xl font-extrabold tracking-tight">
                Make your profile yours
              </h2>
              <div className="border-line bg-surface rounded-xl border p-6 shadow-xs">
                <p className="text-ink-soft text-sm leading-relaxed">
                  Help other students understand what you build and where you want to go next.
                </p>
                <ul className="mt-5 space-y-4">
                  {checklist.map((item) => (
                    <li key={item.label}>
                      <Link
                        to="/profile"
                        className="hover:text-brand-700 flex items-center gap-3 text-sm"
                      >
                        <span
                          aria-hidden="true"
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${item.done ? 'border-accent bg-accent-soft text-accent' : 'border-line text-ink-muted'}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${item.done ? 'bg-accent' : 'bg-line'}`}
                          />
                        </span>
                        <span className="sr-only">{item.done ? 'Complete: ' : 'To do: '}</span>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link to="/profile" className="text-brand-700 mt-6 inline-block text-sm font-bold">
                  View and edit profile
                </Link>
              </div>
            </section>
          </div>
          <div className="space-y-8">
            <section aria-labelledby="viewed-title">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
                <h2 id="viewed-title" className="text-xl font-extrabold tracking-tight">
                  Recently Viewed
                </h2>
                {recentlyViewed.length > 0 && (
                  <button
                    type="button"
                    disabled={clearing}
                    onClick={() => void clearHistory()}
                    className="text-brand-700 text-xs font-semibold disabled:opacity-50"
                  >
                    {clearing ? 'Clearing...' : 'Clear history'}
                  </button>
                )}
              </div>
              {clearError && (
                <p role="alert" className="text-flare mb-3 text-sm">
                  {clearError}
                </p>
              )}
              <div className="border-line bg-surface overflow-hidden rounded-xl border shadow-xs">
                {recentlyViewed.length ? (
                  recentlyViewed.map(({ project, viewedAt }) => (
                    <AccountProjectRow
                      key={project.id}
                      project={project}
                      detail={`Viewed ${new Date(viewedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                    />
                  ))
                ) : (
                  <div className="p-7 text-center">
                    <p className="font-bold">Pick up where you left off</p>
                    <p className="text-ink-muted mt-2 text-sm leading-relaxed">
                      Projects you open while signed in will appear here.
                    </p>
                    <Link
                      to="/projects"
                      className="text-brand-700 mt-4 inline-block text-sm font-bold"
                    >
                      Explore projects
                    </Link>
                  </div>
                )}
              </div>
            </section>
            <section aria-labelledby="activity-title">
              <h2 id="activity-title" className="mb-4 text-xl font-extrabold tracking-tight">
                Project activity
              </h2>
              <div className="border-line bg-surface overflow-hidden rounded-xl border shadow-xs">
                {projects.slice(0, 4).map((project) => (
                  <div
                    key={project.id}
                    className="border-line flex items-start gap-3 border-b p-4 last:border-b-0"
                  >
                    <span
                      aria-hidden="true"
                      className="bg-flare mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    />
                    <div>
                      <Link
                        to={`/projects/${project.slug}`}
                        className="hover:text-brand-700 text-[13.5px] font-bold"
                      >
                        {project.title}
                      </Link>
                      <p className="text-ink-muted mt-1 text-xs leading-relaxed">
                        {project.status === 'approved'
                          ? 'Published in the project gallery.'
                          : project.status === 'pending'
                            ? 'Waiting for project review.'
                            : 'Changes requested before publication.'}
                      </p>
                      <p className="text-ink-muted mt-2 font-mono text-[10px] uppercase">
                        {new Date(project.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <p className="text-ink-muted p-6 text-sm">
                    Your project activity will appear here.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
