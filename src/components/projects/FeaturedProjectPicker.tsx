// Coordinator control for the featured slot: pick an approved project and the window it is live.
// Row level security rejects the write for anyone who is not an admin, whatever this form does.

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { getFeaturedProject, listProjects, setFeaturedProject } from '@/lib/api/client'
import { formatDate } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'

function toIsoDate(offsetDays: number): string {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  return date.toISOString().slice(0, 10)
}

type SaveState =
  { kind: 'idle' } | { kind: 'saving' } | { kind: 'saved' } | { kind: 'error'; message: string }

export function FeaturedProjectPicker() {
  const [version, setVersion] = useState(0)
  const current = useAsync(() => getFeaturedProject(), `featured-${version}`)
  const options = useAsync(() => listProjects({ sort: 'top', perPage: 100 }), 'featured-options')

  const [projectId, setProjectId] = useState('')
  const [startsAt, setStartsAt] = useState(() => toIsoDate(0))
  const [endsAt, setEndsAt] = useState(() => toIsoDate(7))
  const [save, setSave] = useState<SaveState>({ kind: 'idle' })

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!projectId) {
      setSave({ kind: 'error', message: 'Pick a project to feature.' })
      return
    }
    setSave({ kind: 'saving' })
    try {
      await setFeaturedProject({ projectId, startsAt, endsAt })
      setVersion((currentVersion) => currentVersion + 1)
      setSave({ kind: 'saved' })
    } catch (error) {
      setSave({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Could not save the featured project.',
      })
    }
  }

  return (
    <Card>
      <h2 className="font-semibold">Featured project of the week</h2>
      <p className="text-ink-muted mt-1 text-sm">
        The highlight at the top of the projects page, for a window you choose.
      </p>

      <div className="border-line bg-surface-raised mt-4 rounded-lg border p-3 text-sm">
        {current.loading ? (
          <p className="text-ink-muted">Loading the current feature...</p>
        ) : current.error ? (
          <p className="text-danger">Could not load the current feature.</p>
        ) : current.data ? (
          <p>
            Now featured: <span className="font-medium">{current.data.project.title}</span>
            <span className="text-ink-muted">
              {' '}
              ({formatDate(current.data.startsAt)} to {formatDate(current.data.endsAt)})
            </span>
          </p>
        ) : (
          <p className="text-ink-muted">Nothing is featured right now.</p>
        )}
      </div>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <label className="block text-sm">
          <span className="font-medium">Project</span>
          <select
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            className="border-line bg-surface text-ink mt-1.5 h-10 w-full rounded-lg border px-3 text-sm outline-none"
          >
            <option value="">Choose an approved project</option>
            {(options.data?.projects ?? []).map((project) => (
              <option key={project.id} value={project.id}>
                {project.title} ({project.upvoteCount} upvotes)
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap gap-3">
          <label className="block text-sm">
            <span className="font-medium">Live from</span>
            <input
              type="date"
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
              className="border-line bg-surface text-ink mt-1.5 h-10 rounded-lg border px-3 text-sm outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Until</span>
            <input
              type="date"
              value={endsAt}
              onChange={(event) => setEndsAt(event.target.value)}
              className="border-line bg-surface text-ink mt-1.5 h-10 rounded-lg border px-3 text-sm outline-none"
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={save.kind === 'saving'}>
            {save.kind === 'saving' ? 'Saving...' : 'Feature this project'}
          </Button>
          {save.kind === 'saved' && <span className="text-accent-ink text-sm">Featured.</span>}
          {save.kind === 'error' && <span className="text-danger text-sm">{save.message}</span>}
        </div>
      </form>
    </Card>
  )
}
