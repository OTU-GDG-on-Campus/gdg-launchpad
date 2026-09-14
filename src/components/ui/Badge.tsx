// Small status or tag pill.

import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning'

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-raised text-ink-muted',
  brand: 'bg-brand-50 text-brand-700',
  success: 'bg-accent-soft text-accent',
  warning: 'bg-surface-raised text-flare',
}

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        TONES[tone],
      )}
    >
      {children}
    </span>
  )
}
