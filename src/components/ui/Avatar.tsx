// Profile image, falling back to the first letter of the name when there is no picture.

import { cn } from '@/lib/cn'

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-11 w-11 text-base',
}

interface AvatarProps {
  name: string
  src?: string | null
  size?: keyof typeof SIZES
}

export function Avatar({ name, src, size = 'md' }: AvatarProps) {
  if (src) {
    return (
      <img src={src} alt="" className={cn('shrink-0 rounded-full object-cover', SIZES[size])} />
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
      {name.charAt(0)}
    </span>
  )
}
