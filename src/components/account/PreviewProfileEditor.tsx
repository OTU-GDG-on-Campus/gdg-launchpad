// Private browser preview editor with LinkedIn, accessible pin selection, and save feedback.

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { saveProfilePreview } from '@/lib/api/client'
import { cn } from '@/lib/cn'
import { MAX_PINNED_PROJECTS } from '@/lib/profilePreview'
import type { ProfilePreview, Project } from '@/types'

const FIELD =
  'border-line bg-surface-muted text-ink mt-2 w-full rounded-lg border px-3 py-3 text-sm'

interface PreviewProfileEditorProps {
  profile: ProfilePreview
  projects: Project[]
  onSave: (profile: ProfilePreview) => void
  onCancel: () => void
}

export function PreviewProfileEditor({
  profile,
  projects,
  onSave,
  onCancel,
}: PreviewProfileEditorProps) {
  const [form, setForm] = useState(profile)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const eligibleProjects = projects.filter(
    (project) => project.status === 'approved' && project.authorId === profile.userId,
  )
  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
    heading.current?.scrollIntoView({ block: 'start' })
  }, [])

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    setError(null)
    try {
      onSave(await saveProfilePreview(profile.userId, form))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save your preview.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section
      aria-labelledby="edit-profile-title"
      className="border-line bg-surface rounded-xl border p-6 sm:p-8"
    >
      <h2
        ref={heading}
        tabIndex={-1}
        id="edit-profile-title"
        className="scroll-mt-44 text-xl font-extrabold outline-none"
      >
        Edit profile
      </h2>
      <p className="text-ink-muted mt-2 text-sm leading-relaxed">
        These changes are private to this browser. To update what others see, use{' '}
        <Link to="/me/settings/profile" className="text-brand-700 underline underline-offset-4">
          public profile settings
        </Link>
        .
      </p>
      <form onSubmit={(event) => void save(event)} onChange={() => setError(null)} className="mt-6">
        <fieldset disabled={saving} className="grid gap-5 sm:grid-cols-2">
          <legend className="sr-only">Profile preview details</legend>
          <label className="text-sm font-semibold sm:col-span-2">
            Name
            <input
              required
              maxLength={100}
              autoComplete="name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className={FIELD}
            />
          </label>
          <label className="text-sm font-semibold">
            Program
            <input
              maxLength={100}
              value={form.program}
              onChange={(event) => setForm({ ...form, program: event.target.value })}
              className={FIELD}
              placeholder="Computer Science"
            />
          </label>
          <label className="text-sm font-semibold">
            Year
            <select
              value={form.year}
              onChange={(event) => setForm({ ...form, year: event.target.value })}
              className={FIELD}
            >
              <option value="">Select your year</option>
              {['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5+', 'Graduate'].map((year) => (
                <option key={year}>{year}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold sm:col-span-2">
            About me
            <textarea
              maxLength={1000}
              rows={4}
              value={form.about}
              onChange={(event) => setForm({ ...form, about: event.target.value })}
              className={FIELD}
              placeholder="What do you like to build?"
            />
          </label>
          <label className="text-sm font-semibold sm:col-span-2">
            LinkedIn URL <span className="text-ink-muted font-normal">(optional)</span>
            <input
              inputMode="url"
              autoComplete="url"
              maxLength={2048}
              value={form.linkedinUrl}
              onChange={(event) => setForm({ ...form, linkedinUrl: event.target.value })}
              className={FIELD}
              placeholder="https://www.linkedin.com/in/your-name"
            />
          </label>
          <fieldset className="sm:col-span-2">
            <legend className="text-sm font-semibold">Pinned projects</legend>
            <p className="text-ink-muted mt-2 text-sm">
              Choose up to {MAX_PINNED_PROJECTS} published projects. They appear in the order you
              select them.
            </p>
            <p role="status" className="text-brand-700 mt-2 text-sm font-semibold">
              {form.pinnedProjectIds.length} of {MAX_PINNED_PROJECTS} selected
              {form.pinnedProjectIds.length >= MAX_PINNED_PROJECTS &&
                '. Unpin one to choose another.'}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {eligibleProjects.map((project) => (
                <label
                  key={project.id}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border p-4 text-sm transition-colors',
                    form.pinnedProjectIds.includes(project.id)
                      ? 'border-brand-700 bg-brand-50'
                      : 'border-line has-disabled:opacity-50',
                  )}
                >
                  <input
                    type="checkbox"
                    className="accent-brand-700 mt-1"
                    checked={form.pinnedProjectIds.includes(project.id)}
                    disabled={
                      !form.pinnedProjectIds.includes(project.id) &&
                      form.pinnedProjectIds.length >= MAX_PINNED_PROJECTS
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        pinnedProjectIds: event.target.checked
                          ? [...form.pinnedProjectIds, project.id]
                          : form.pinnedProjectIds.filter((id) => id !== project.id),
                      })
                    }
                  />
                  <span className="min-w-0">
                    <span className="block font-semibold break-words">{project.title}</span>
                    <span className="text-ink-muted mt-1 block text-xs">{project.category}</span>
                  </span>
                </label>
              ))}
            </div>
            {eligibleProjects.length === 0 && (
              <p className="text-ink-muted mt-3 text-sm">
                Your published projects will be available to pin here.
              </p>
            )}
          </fieldset>
          {error && (
            <p role="alert" className="text-flare text-sm sm:col-span-2">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-brand-500 text-on-brand hover:bg-brand-600 rounded-lg px-5 py-3 text-sm font-bold disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save preview'}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={onCancel}
              className="border-line hover:border-brand-700 rounded-lg border px-5 py-3 text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </fieldset>
      </form>
    </section>
  )
}
