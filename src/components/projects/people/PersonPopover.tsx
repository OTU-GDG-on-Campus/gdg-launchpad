// Compact public profile preview for a builder, anchored below its trigger on pointer devices
// and shown as a bottom sheet on touch. Only details already public on project records appear.

import { useEffect, useRef, useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { getPersonPreview } from '@/lib/api/client'
import { useAsync } from '@/lib/useAsync'

interface PersonPopoverProps {
  name: string
  profileId?: string | null
  roleOnProject?: string | null
  onClose: () => void
}

export function PersonPopover({ name, profileId, roleOnProject, onClose }: PersonPopoverProps) {
  const [touch] = useState(() => window.matchMedia('(pointer: coarse)').matches)
  const ref = useRef<HTMLDivElement>(null)

  const key = [name, profileId ?? 'none', roleOnProject ?? 'none'].join('|')
  const { data, loading, error } = useAsync(
    () => getPersonPreview({ name, profileId, roleOnProject }),
    key,
  )

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    function onPointerDown(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [onClose])

  function preview() {
    if (loading) return <p className="text-ink-muted text-sm">Loading profile...</p>
    if (error) return <p className="text-ink-muted text-sm">Could not load this profile.</p>
    if (!data) return <p className="text-ink-muted text-sm">No public profile for {name} yet.</p>

    return (
      <>
        <div className="flex items-center gap-3">
          <Avatar name={data.name} src={data.avatarUrl} size="lg" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{data.name}</p>
            {data.headline && <p className="text-ink-muted truncate text-sm">{data.headline}</p>}
          </div>
        </div>
        <dl className="border-line mt-4 space-y-2 border-t pt-3 text-sm">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-ink-muted">Projects on LaunchPad</dt>
            <dd className="font-medium tabular-nums">{data.projectCount}</dd>
          </div>
          {data.roleOnProject && (
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-ink-muted">On this project</dt>
              <dd className="text-right font-medium">{data.roleOnProject}</dd>
            </div>
          )}
        </dl>
      </>
    )
  }

  if (touch) {
    return (
      <>
        <div className="fixed inset-0 z-[65] bg-black/50" aria-hidden="true" onClick={onClose} />
        <div
          ref={ref}
          role="dialog"
          aria-label={`${name}'s profile`}
          className="border-line bg-surface fixed inset-x-0 bottom-0 z-[66] rounded-t-2xl border-t p-5 pb-8"
        >
          {preview()}
        </div>
      </>
    )
  }

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={`${name}'s profile`}
      className="border-line bg-surface shadow-card-hover absolute top-full left-1/2 z-30 mt-2 w-72 -translate-x-1/2 rounded-xl border p-4"
    >
      {preview()}
    </div>
  )
}
