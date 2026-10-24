// Browser-only profile editor. Public changes still need a moderated backend workflow.

import { useState, type FormEvent } from 'react'
import { saveProfilePreview } from '@/lib/api/client'
import type { ProfilePreview, Project } from '@/types'

const FIELD =
  'border-line bg-surface-muted text-ink mt-2 w-full rounded-lg border px-3 py-3 text-sm'

interface ProfileEditorProps {
  profile: ProfilePreview
  projects: Project[]
  onSave: (profile: ProfilePreview) => void
  onCancel: () => void
}

export function ProfileEditor({ profile, projects, onSave, onCancel }: ProfileEditorProps) {
  const [form, setForm] = useState(profile)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

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
      <h2 id="edit-profile-title" className="text-xl font-extrabold">
        Edit profile
      </h2>
      <p className="text-ink-muted mt-2 text-sm leading-relaxed">
        Save a preview on this browser. It does not change your public profile or send a moderation
        request.
      </p>
      <form onSubmit={(event) => void save(event)} className="mt-6 grid gap-5 sm:grid-cols-2">
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
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-semibold">Pinned projects</legend>
          <p className="text-ink-muted mt-2 text-xs">
            Choose up to three of your published projects.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {projects
              .filter((project) => project.status === 'approved')
              .map((project) => (
                <label
                  key={project.id}
                  className="border-line flex items-start gap-3 rounded-lg border p-3 text-sm"
                >
                  <input
                    type="checkbox"
                    className="accent-brand-700 mt-1"
                    checked={form.pinnedProjectIds.includes(project.id)}
                    disabled={
                      !form.pinnedProjectIds.includes(project.id) &&
                      form.pinnedProjectIds.length >= 3
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
                  {project.title}
                </label>
              ))}
          </div>
          {projects.length === 0 && (
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
      </form>
    </section>
  )
}
