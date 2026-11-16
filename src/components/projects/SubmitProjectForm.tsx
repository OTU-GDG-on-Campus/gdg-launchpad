// Project submission form. A submitted project is saved as pending and waits for a coordinator.

import { useState, type ReactNode, type SyntheticEvent } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PROJECT_CATEGORIES } from '@/config/site'
import { submitProject } from '@/lib/api/client'
import {
  EMPTY_SUBMISSION,
  SUBMISSION_LIMITS,
  validateSubmission,
  type SubmissionErrors,
  type SubmissionInput,
} from '@/lib/projects/submission'
import type { Project } from '@/types'

const FIELD_CLASS =
  'border-line bg-surface text-ink focus:border-brand-700 mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none'

interface FieldProps {
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
}

function Field({ id, label, hint, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-ink-muted mt-1.5 text-xs">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-danger mt-1.5 text-xs">
          {error}
        </p>
      )}
    </div>
  )
}

export function SubmitProjectForm() {
  const [values, setValues] = useState<SubmissionInput>(EMPTY_SUBMISSION)
  const [errors, setErrors] = useState<SubmissionErrors>({})
  const [saving, setSaving] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const [created, setCreated] = useState<Project | null>(null)

  function update<Key extends keyof SubmissionInput>(key: Key, value: SubmissionInput[Key]) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    setFailure(null)
    const result = validateSubmission(values)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    setSaving(true)
    try {
      setCreated(await submitProject(result.value))
    } catch (cause) {
      setFailure(cause instanceof Error ? cause.message : 'Could not submit the project.')
    } finally {
      setSaving(false)
    }
  }

  if (created) {
    return (
      <Card>
        <h2 className="font-semibold">Submitted for review</h2>
        <p className="text-ink-soft mt-2 text-sm leading-relaxed">
          &quot;{created.title}&quot; was saved as pending. A coordinator will review it before it
          appears on the projects page.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/me/projects"
            className="bg-brand-500 text-on-brand hover:bg-brand-600 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors"
          >
            View my projects
          </Link>
          <Button
            variant="secondary"
            onClick={() => {
              setCreated(null)
              setValues(EMPTY_SUBMISSION)
            }}
          >
            Submit another
          </Button>
        </div>
      </Card>
    )
  }

  const limits = SUBMISSION_LIMITS

  return (
    <Card>
      <form onSubmit={(event) => void handleSubmit(event)} noValidate className="space-y-5">
        <Field
          id="project-title"
          label="Project title"
          hint={`${values.title.trim().length}/${limits.titleMax}`}
          error={errors.title}
        >
          <input
            id="project-title"
            value={values.title}
            maxLength={limits.titleMax}
            onChange={(event) => update('title', event.target.value)}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'project-title-error' : undefined}
            className={FIELD_CLASS}
          />
        </Field>

        <Field
          id="project-summary"
          label="One line summary"
          hint={`${values.summary.trim().length}/${limits.summaryMax}. Shown on the project card.`}
          error={errors.summary}
        >
          <textarea
            id="project-summary"
            rows={2}
            value={values.summary}
            maxLength={limits.summaryMax}
            onChange={(event) => update('summary', event.target.value)}
            aria-invalid={Boolean(errors.summary)}
            aria-describedby={errors.summary ? 'project-summary-error' : undefined}
            className={FIELD_CLASS}
          />
        </Field>

        <Field
          id="project-description"
          label="Description (optional)"
          hint="Plain text for now. Bold and other formatting are not supported yet."
          error={errors.description}
        >
          <textarea
            id="project-description"
            rows={6}
            value={values.description}
            maxLength={limits.descriptionMax}
            onChange={(event) => update('description', event.target.value)}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? 'project-description-error' : undefined}
            className={FIELD_CLASS}
          />
        </Field>

        <Field id="project-category" label="Category" error={errors.category}>
          <select
            id="project-category"
            value={values.category}
            onChange={(event) => update('category', event.target.value)}
            aria-invalid={Boolean(errors.category)}
            aria-describedby={errors.category ? 'project-category-error' : undefined}
            className={FIELD_CLASS}
          >
            <option value="">Choose a category</option>
            {PROJECT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>

        <Field
          id="project-tags"
          label="Tech stack and skills (optional)"
          hint={`Separate with commas, up to ${limits.tagsMax}. For example React, Supabase, Python.`}
          error={errors.tags}
        >
          <input
            id="project-tags"
            value={values.tags}
            onChange={(event) => update('tags', event.target.value)}
            aria-invalid={Boolean(errors.tags)}
            aria-describedby={errors.tags ? 'project-tags-error' : undefined}
            className={FIELD_CLASS}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="project-repo" label="Repository link (optional)" error={errors.repoUrl}>
            <input
              id="project-repo"
              inputMode="url"
              placeholder="https://github.com/..."
              value={values.repoUrl}
              onChange={(event) => update('repoUrl', event.target.value)}
              aria-invalid={Boolean(errors.repoUrl)}
              aria-describedby={errors.repoUrl ? 'project-repo-error' : undefined}
              className={FIELD_CLASS}
            />
          </Field>
          <Field id="project-live" label="Live demo link (optional)" error={errors.liveUrl}>
            <input
              id="project-live"
              inputMode="url"
              placeholder="https://..."
              value={values.liveUrl}
              onChange={(event) => update('liveUrl', event.target.value)}
              aria-invalid={Boolean(errors.liveUrl)}
              aria-describedby={errors.liveUrl ? 'project-live-error' : undefined}
              className={FIELD_CLASS}
            />
          </Field>
        </div>

        <label className="text-ink-soft flex items-start gap-3 text-sm leading-relaxed">
          <input
            type="checkbox"
            checked={values.openToContributions}
            onChange={(event) => update('openToContributions', event.target.checked)}
            className="accent-brand-700 mt-1 h-4 w-4 shrink-0"
          />
          Open to contributions from other students
        </label>

        <p className="text-ink-muted text-xs leading-relaxed">
          Thumbnails, screenshots, and a demo video are not supported yet. Submissions are reviewed
          by a coordinator before they appear on the projects page.
        </p>

        {failure && (
          <p role="alert" className="border-flare text-ink rounded-lg border p-3 text-sm">
            {failure}
          </p>
        )}

        <Button type="submit" size="lg" disabled={saving} aria-busy={saving}>
          {saving ? 'Submitting...' : 'Submit for review'}
        </Button>
      </form>
    </Card>
  )
}
