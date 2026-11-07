// Public contributor directory derived from the current public project feed.

import { Link } from 'react-router'
import { Avatar } from '@/components/ui/Avatar'
import { ErrorState, LoadingState } from '@/components/ui/PageState'
import { listContributors } from '@/lib/api/client'
import { useAsync } from '@/lib/useAsync'

export function ContributorsPage() {
  const contributors = useAsync(listContributors, 'contributors')
  return (
    <div className="mx-auto max-w-290 px-6 py-14 sm:px-11 sm:pb-24">
      <p className="text-brand-700 font-mono text-xs tracking-widest uppercase">Built together</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Contributors</h1>
      <p className="text-ink-soft mt-4 max-w-2xl leading-relaxed">
        The students behind the projects, from project creators to the people helping them ship.
      </p>
      <p className="text-ink-muted mt-3 text-xs">
        This directory currently reflects the sample projects.
      </p>
      <div className="mt-8">
        {contributors.error ? (
          <ErrorState error={contributors.error} />
        ) : contributors.loading ? (
          <LoadingState label="Loading contributors" />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {contributors.data?.map((person) => (
              <li
                key={person.id}
                className="border-line bg-surface flex items-center gap-4 rounded-xl border p-5"
              >
                <Avatar name={person.name} src={person.avatarUrl} size="lg" />
                <div>
                  <h2 className="font-bold">{person.name}</h2>
                  <p className="text-ink-muted mt-1 text-xs">
                    {person.projectCount} {person.projectCount === 1 ? 'project' : 'projects'} ·{' '}
                    {person.role || 'Contributor'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Link to="/projects" className="text-brand-700 mt-8 inline-block text-sm font-bold">
        Explore the projects
      </Link>
    </div>
  )
}
