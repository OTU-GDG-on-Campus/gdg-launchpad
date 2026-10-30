// Resumable onboarding and profile settings share forms, validation, private drafts, and previews.

import { useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { ProfileSummary } from '@/components/account/ProfileSummary'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/PageState'
import { Toast } from '@/components/ui/Toast'
import { ONBOARDING_STEPS } from '@/config/onboarding'
import { useOnboardingDraft } from '@/hooks/useOnboardingDraft'
import { publishDeveloperProfile } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/useAuth'
import { cn } from '@/lib/cn'
import { onboardingErrors, onboardingPreview, profileToOnboarding } from '@/lib/onboarding'
import type { AccountProfile } from '@/types'
import { ProfileFields } from './ProfileFields'

export function ProfileWizard({ profile }: { profile?: AccountProfile }) {
  const { user, completeRegistration, refreshUser } = useAuth()
  const initial = useMemo(() => (profile ? profileToOnboarding(profile) : undefined), [profile])
  const draft = useOnboardingDraft(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [attempted, setAttempted] = useState(false)
  const [pending, setPending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [welcome, setWelcome] = useState(false)
  const [toast, setToast] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const navigate = useNavigate()
  const editing = Boolean(profile)
  const busy = pending || uploading
  useEffect(() => {
    heading.current?.focus()
  }, [draft.step, draft.loading])
  useEffect(() => {
    if (!welcome) return
    const timer = setTimeout(() => navigate('/me/projects', { replace: true }), 2200)
    return () => clearTimeout(timer)
  }, [welcome, navigate])
  if (user?.registeredAt && !editing && !pending && !welcome)
    return <Navigate to="/me/projects" replace />
  if (draft.loading) return <LoadingState label="Restoring your private profile draft" />
  if (draft.loadError)
    return (
      <div role="alert" className="space-y-4">
        <p>{draft.loadError}</p>
        <Button onClick={draft.reload}>Retry loading</Button>
        <Link to="/login" className="text-brand-700 ml-4">
          Sign in again
        </Link>
      </div>
    )
  if (welcome)
    return (
      <div role="status" className="py-14 text-center">
        <span
          className="bg-brand-50 text-brand-700 mx-auto grid size-20 place-items-center rounded-full text-4xl"
          aria-hidden="true"
        >
          ✓
        </span>
        <h1 className="mt-6 text-3xl font-bold">You’re in. Let’s build something.</h1>
        <p className="text-ink-soft mx-auto mt-4 max-w-md">
          Welcome to LaunchPad, {draft.details.displayName || draft.details.firstName}. Your profile
          is ready. Opening your student workspace...
        </p>
        <Link to="/me/projects" className="text-brand-700 mt-6 inline-block font-semibold">
          Go to my dashboard →
        </Link>
      </div>
    )

  async function goTo(step: number, validate: boolean) {
    if (busy) return
    if (validate) {
      const nextErrors = onboardingErrors(draft.details, draft.step)
      setErrors(nextErrors)
      setAttempted(true)
      if (Object.keys(nextErrors).length) {
        setError('Check the highlighted fields before continuing.')
        return
      }
    }
    setPending(true)
    setError(null)
    try {
      await draft.goTo(step)
      setErrors({})
      setAttempted(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save progress.')
    } finally {
      setPending(false)
    }
  }
  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    if (draft.step < 7) {
      await goTo(draft.step + 1, true)
      return
    }
    const nextErrors = onboardingErrors(draft.details)
    setErrors(nextErrors)
    setAttempted(true)
    if (Object.keys(nextErrors).length) {
      setError('Some profile fields need attention. Use the edit buttons to review them.')
      return
    }
    setPending(true)
    setError(null)
    try {
      await draft.publish(editing ? publishDeveloperProfile : completeRegistration)
      if (editing) {
        await refreshUser()
        setToast(true)
      } else setWelcome(true)
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Could not save your profile. Please retry.',
      )
    } finally {
      setPending(false)
    }
  }
  return (
    <div>
      <div className="mb-7">
        <p className="text-brand-700 font-mono text-xs tracking-widest uppercase">
          {editing ? 'Your profile' : `Create account · Step ${draft.step} of 7`}
        </p>
        <h1
          ref={heading}
          tabIndex={-1}
          className="mt-3 text-3xl font-bold tracking-tight outline-none"
        >
          {ONBOARDING_STEPS[draft.step - 1]}
        </h1>
        <progress
          aria-label="Registration progress"
          max={7}
          value={draft.step}
          className="onboarding-progress mt-5 h-1.5 w-full"
        />
      </div>
      <nav aria-label="Profile steps" className="mb-6 flex flex-wrap gap-2">
        {[3, 4, 5, 6, 7].map((step) => (
          <button
            key={step}
            type="button"
            disabled={busy || (!editing && step > draft.step)}
            aria-current={step === draft.step ? 'step' : undefined}
            onClick={() => void goTo(step, step > draft.step)}
            className={cn(
              'min-h-10 rounded-lg border px-3 py-2 text-xs disabled:opacity-40',
              step === draft.step
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-line text-ink-muted',
            )}
          >
            {step - 2}. {ONBOARDING_STEPS[step - 1]}
          </button>
        ))}
      </nav>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-xs">
        <p role="status" className="text-ink-muted">
          {draft.saveState}
        </p>
        {draft.saveError && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => void draft.save().catch(() => {})}
          >
            Retry save
          </Button>
        )}
      </div>
      {draft.saveError && (
        <p role="alert" className="border-danger mb-5 rounded-lg border p-3 text-sm">
          {draft.saveError}{' '}
          <Link to="/login" className="text-brand-700 underline">
            Sign in again
          </Link>
        </p>
      )}
      <form onSubmit={(event) => void submit(event)} noValidate>
        <fieldset disabled={pending}>
          <div key={draft.step} className="onboarding-enter">
            {draft.step === 7 ? (
              <div>
                <p className="text-ink-soft mb-5 text-sm">
                  This is how your public profile will look. Your email, private links, and
                  unfinished drafts are never shown.
                </p>
                <ProfileSummary profile={onboardingPreview(draft.details, user?.id ?? '')} />
                <div className="mb-5 flex flex-wrap gap-2">
                  {[3, 4, 5, 6].map((step) => (
                    <Button
                      key={step}
                      type="button"
                      variant="secondary"
                      onClick={() => void goTo(step, false)}
                    >
                      Edit {ONBOARDING_STEPS[step - 1].toLowerCase()}
                    </Button>
                  ))}
                </div>
                {draft.details.links.some((link) => !link.isPublic) && (
                  <div className="border-line rounded-xl border p-4">
                    <h2 className="text-sm font-semibold">
                      Private links (only you can see these)
                    </h2>
                    <ul className="text-ink-muted mt-2 space-y-1 text-xs">
                      {draft.details.links
                        .filter((link) => !link.isPublic)
                        .map((link) => (
                          <li key={link.id} className="break-all">
                            {link.label}: {link.value}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <ProfileFields
                step={draft.step}
                details={draft.details}
                errors={errors}
                onBusy={setUploading}
                onChange={(patch) => {
                  draft.update(patch)
                  if (attempted)
                    setErrors(onboardingErrors({ ...draft.details, ...patch }, draft.step))
                  setError(null)
                }}
              />
            )}
          </div>
        </fieldset>
        {draft.step < 7 && (
          <details className="border-line mt-6 rounded-xl border p-4">
            <summary className="text-brand-700 min-h-8 cursor-pointer text-sm font-semibold">
              Live profile preview
            </summary>
            <div className="mt-4">
              <ProfileSummary profile={onboardingPreview(draft.details, user?.id ?? '')} />
            </div>
          </details>
        )}
        {error && (
          <p role="alert" className="border-danger text-danger mt-5 rounded-xl border p-4 text-sm">
            {error}
          </p>
        )}
        {draft.step === 7 && Object.keys(errors).length > 0 && (
          <ul className="text-danger mt-3 space-y-1 text-sm">
            {Object.entries(errors).map(([key, message]) => (
              <li key={key}>
                {key.startsWith('link-') ? 'Social link' : key}: {message}
              </li>
            ))}
          </ul>
        )}
        <div className="border-line mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-6">
          <div>
            {draft.step > 3 && (
              <Button
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={() => void goTo(draft.step - 1, false)}
              >
                ← Back
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {draft.step >= 4 && draft.step <= 6 && (
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => void goTo(draft.step + 1, true)}
              >
                Skip for now
              </Button>
            )}
            <Button type="submit" size="lg" disabled={busy} aria-busy={busy}>
              {uploading
                ? 'Uploading image...'
                : pending
                  ? 'Saving...'
                  : draft.step === 7
                    ? editing
                      ? 'Save profile'
                      : 'Complete Registration'
                    : 'Continue →'}
            </Button>
          </div>
        </div>
      </form>
      {!editing && (
        <p className="text-ink-muted mt-6 text-xs leading-relaxed">
          Your email is verified. Progress is saved privately as you go. You can change every
          profile detail later in Settings.
        </p>
      )}
      {toast && (
        <Toast
          message="Profile saved. Your public page is up to date."
          onDismiss={() => setToast(false)}
        />
      )}
    </div>
  )
}
