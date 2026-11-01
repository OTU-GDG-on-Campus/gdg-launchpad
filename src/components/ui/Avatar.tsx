// Circular profile image with initials when the image is absent or cannot be loaded.

import { cn } from '@/lib/cn'
import { useState } from 'react'

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-11 w-11 text-base',
  xl: 'h-24 w-24 text-2xl',
}

interface AvatarProps {
  name: string
  src?: string | null
  size?: keyof typeof SIZES
}

export function Avatar({ name, src, size = 'md' }: AvatarProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  if (src && src !== failedUrl) {
    return (
      <img src={src} alt="" onError={() => setFailedUrl(src)} className={cn('shrink-0 rounded-full object-cover', SIZES[size])} />
    )
  }

  return (
    <span
      aria-hidden
      className={cn(
        'bg-surface-raised text-ink-muted inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
        SIZES[size],
      )}
    >
      {name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || '?'}
    </span>
  )
}
