// Serializes debounced private draft saves, restores progress, and prevents stale writes after publication.

import { useCallback, useEffect, useRef, useState } from 'react'
import { isBackendConfigured, loadOnboardingDraft, saveOnboardingDraft } from '@/lib/api/client'
import { emptyOnboarding, resumeOnboardingStep } from '@/lib/onboarding'
import type { OnboardingDetails } from '@/types'

export function useOnboardingDraft(initial?: OnboardingDetails) {
  const [details, setDetails] = useState(initial ?? emptyOnboarding)
  const [step, setStep] = useState(3)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveState, setSaveState] = useState('All changes saved privately')
  const [retry, setRetry] = useState(0)
  const latest = useRef({ details, step })
  const revision = useRef(0)
  const saved = useRef('')
  const queue = useRef<Promise<unknown>>(Promise.resolve())
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const paused = useRef(false)
  const active = useRef(true)

  useEffect(() => {
    active.current = true
    let current = true
    const load =
      !isBackendConfigured && initial
        ? Promise.resolve({ details: initial, step: 3, revision: 0 })
        : loadOnboardingDraft()
    void load
      .then((draft) => {
        if (!current) return
        const nextStep = initial ? 3 : resumeOnboardingStep(draft.step, draft.details)
        latest.current = { details: draft.details, step: nextStep }
        revision.current = draft.revision
        saved.current = JSON.stringify(latest.current)
        setDetails(draft.details)
        setStep(nextStep)
      })
      .catch((cause) => {
        if (current)
          setLoadError(cause instanceof Error ? cause.message : 'Could not load your progress.')
      })
      .finally(() => {
        if (current) setLoading(false)
      })
    return () => {
      current = false
      active.current = false
      clearTimeout(timer.current)
    }
  }, [initial, retry])

  const save = useCallback((targetStep?: number) => {
    clearTimeout(timer.current)
    const snapshot = { ...latest.current, step: targetStep ?? latest.current.step }
    const signature = JSON.stringify(snapshot)
    const operation = queue.current
      .catch(() => {})
      .then(async () => {
        if (signature === saved.current || !isBackendConfigured) return revision.current
        if (active.current) setSaveState('Saving your private draft...')
        const nextRevision = await saveOnboardingDraft(
          snapshot.details,
          snapshot.step,
          revision.current,
        )
        revision.current = nextRevision
        saved.current = signature
        if (active.current) {
          setSaveError(null)
          setSaveState(
            signature === JSON.stringify(latest.current)
              ? 'All changes saved privately'
              : 'Unsaved changes',
          )
        }
        return nextRevision
      })
    queue.current = operation
    void operation.catch((cause) => {
      if (active.current) {
        setSaveError(cause instanceof Error ? cause.message : 'Your draft could not be saved.')
        setSaveState('Changes have not been saved')
      }
    })
    return operation
  }, [])

  useEffect(() => {
    if (loading || loadError || paused.current || JSON.stringify(latest.current) === saved.current)
      return
    timer.current = setTimeout(() => {
      void save().catch(() => {})
    }, 650)
    return () => clearTimeout(timer.current)
  }, [details, step, loading, loadError, save])

  useEffect(() => {
    function beforeUnload(event: BeforeUnloadEvent) {
      if (JSON.stringify(latest.current) !== saved.current && !paused.current) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [])

  function update(patch: Partial<OnboardingDetails>) {
    const next = { ...latest.current.details, ...patch }
    latest.current = { ...latest.current, details: next }
    setDetails(next)
    setSaveState(
      isBackendConfigured
        ? 'Unsaved changes'
        : 'Demo changes are saved when you choose Save profile',
    )
  }

  async function goTo(target: number) {
    await save(target)
    latest.current = { ...latest.current, step: target }
    setStep(target)
    setSaveState(
      isBackendConfigured
        ? 'All changes saved privately'
        : 'Demo changes are saved when you choose Save profile',
    )
  }

  async function publish(action: (details: OnboardingDetails, revision: number) => Promise<void>) {
    paused.current = true
    clearTimeout(timer.current)
    try {
      const currentRevision = await save()
      await action(latest.current.details, currentRevision)
      revision.current = 0
      saved.current = JSON.stringify(latest.current)
      setSaveError(null)
      setSaveState('Profile saved')
    } finally {
      paused.current = false
    }
  }

  return {
    details,
    step,
    loading,
    loadError,
    saveError,
    saveState,
    update,
    goTo,
    save,
    publish,
    reload: () => {
      setLoading(true)
      setLoadError(null)
      setRetry((value) => value + 1)
    },
  }
}
