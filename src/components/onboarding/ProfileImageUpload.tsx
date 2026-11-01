// Native image crop controls, live positioning preview, and real Supabase upload progress.

import { useEffect, useId, useRef, useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { isBackendConfigured, uploadProfileMedia } from '@/lib/api/client'
import { cropProfileImage, cropRectangle, validateProfileImage } from '@/lib/profileImage'
import type { ProfileMediaKind } from '@/types'

interface ProfileImageUploadProps {
  kind: ProfileMediaKind
  name: string
  url: string | null
  onChange: (path: string | null, url: string | null) => void
  onBusy: (busy: boolean) => void
}

export function ProfileImageUpload({ kind, name, url, onChange, onBusy }: ProfileImageUploadProps) {
  const id = useId()
  const [file, setRawFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState({ width: 1, height: 1 })
  const [zoom, setZoom] = useState(1)
  const [x, setX] = useState(50)
  const [y, setY] = useState(50)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const alive = useRef(true)
  const title = kind === 'avatar' ? 'Profile picture' : 'Profile banner'
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])
  function setFile(next: File | null) {
    setRawFile(next)
    setPreview(next ? URL.createObjectURL(next) : null)
  }
  const crop = cropRectangle(
    dimensions.width,
    dimensions.height,
    kind === 'avatar' ? 1 : 3,
    zoom,
    x,
    y,
  )
  async function upload() {
    if (!file || busy) return
    setBusy(true)
    onBusy(true)
    setError(null)
    setProgress(0)
    try {
      const cropped = await cropProfileImage(file, kind, zoom, x, y)
      const result = await uploadProfileMedia(cropped, kind, setProgress)
      if (alive.current) {
        onChange(result.path, result.url)
        setFile(null)
      }
    } catch (cause) {
      if (alive.current)
        setError(cause instanceof Error ? cause.message : 'Could not upload this image.')
    } finally {
      if (alive.current) {
        setBusy(false)
        onBusy(false)
      }
    }
  }
  return (
    <fieldset disabled={busy} className="border-line space-y-4 rounded-2xl border p-5">
      <legend className="px-2 text-sm font-semibold">
        {title} <span className="text-ink-muted font-normal">(optional)</span>
      </legend>
      {preview ? (
        <div
          className={
            kind === 'avatar'
              ? 'bg-surface-raised relative mx-auto aspect-square w-48 overflow-hidden rounded-full'
              : 'bg-surface-raised relative aspect-[3/1] w-full overflow-hidden rounded-xl'
          }
        >
          <img
            src={preview}
            alt={`${title} crop preview`}
            onLoad={(event) =>
              setDimensions({
                width: event.currentTarget.naturalWidth,
                height: event.currentTarget.naturalHeight,
              })
            }
            onError={() => {
              setError('This file cannot be decoded as an image. Choose another file.')
              setFile(null)
            }}
            className="absolute max-w-none"
            style={{
              width: `${(dimensions.width / crop.width) * 100}%`,
              height: `${(dimensions.height / crop.height) * 100}%`,
              left: `${(-crop.x / crop.width) * 100}%`,
              top: `${(-crop.y / crop.height) * 100}%`,
            }}
          />
        </div>
      ) : kind === 'avatar' ? (
        <div className="flex justify-center">
          <Avatar name={name || 'Student'} src={url} size="xl" />
        </div>
      ) : url ? (
        <img
          src={url}
          alt="Your profile banner"
          className="aspect-[3/1] w-full rounded-xl object-cover"
        />
      ) : (
        <div
          className="discovery-hero aspect-[3/1] rounded-xl"
          aria-label="Default gradient banner"
        />
      )}
      {preview && (
        <div className="space-y-3">
          {[
            { label: 'Zoom', value: zoom, set: setZoom, min: 1, max: 3, step: 0.05 },
            { label: 'Horizontal position', value: x, set: setX, min: 0, max: 100, step: 1 },
            { label: 'Vertical position', value: y, set: setY, min: 0, max: 100, step: 1 },
          ].map((control) => (
            <label key={control.label} className="block text-xs font-medium">
              {control.label}
              <input
                type="range"
                className="accent-brand-500 mt-2 block w-full"
                min={control.min}
                max={control.max}
                step={control.step}
                value={control.value}
                onChange={(event) => control.set(Number(event.target.value))}
              />
            </label>
          ))}
        </div>
      )}
      <div>
        <label htmlFor={id} className="mb-2 block text-sm font-medium">
          {url ? 'Replace image' : 'Choose an image'}
        </label>
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={!isBackendConfigured || busy}
          className="text-ink-soft file:border-line file:bg-surface-raised file:text-ink w-full min-w-0 text-xs file:mr-3 file:rounded-lg file:border file:px-3 file:py-3 disabled:opacity-50"
          onChange={(event) => {
            const chosen = event.target.files?.[0]
            event.target.value = ''
            if (!chosen) return
            try {
              validateProfileImage(chosen, kind)
              setFile(chosen)
              setZoom(1)
              setX(50)
              setY(50)
              setError(null)
            } catch (cause) {
              setError(cause instanceof Error ? cause.message : 'Invalid image.')
            }
          }}
        />
      </div>
      <p className="text-ink-muted text-xs">
        JPG, PNG, or WebP. Maximum{' '}
        {kind === 'avatar'
          ? '5 MB. Square crop with a circular preview.'
          : '10 MB. Recommended ratio 3:1.'}
        {!isBackendConfigured && ' Uploads are unavailable in demo mode.'}
      </p>
      {busy && (
        <div role="status">
          <p className="text-ink-soft mb-2 text-xs">
            {progress === 100 ? 'Finalizing upload...' : `Uploading ${progress}%`}
          </p>
          <progress
            aria-label={`${title} upload progress`}
            max={100}
            value={progress}
            className="accent-brand-500 w-full"
          />
        </div>
      )}
      {error && (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        {preview && (
          <>
            <Button type="button" disabled={busy} onClick={() => void upload()}>
              {busy ? 'Uploading...' : 'Crop & upload'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setFile(null)}>
              Cancel crop
            </Button>
          </>
        )}
        {url && !preview && (
          <Button type="button" variant="ghost" onClick={() => onChange(null, null)}>
            Remove image
          </Button>
        )}
      </div>
    </fieldset>
  )
}
