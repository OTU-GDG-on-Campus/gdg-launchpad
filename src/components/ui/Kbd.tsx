// Small keyboard key hint, used by the search trigger and the command palette.

import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'border-line bg-surface-raised text-ink-muted inline-flex items-center rounded-md border px-1.5 py-0.5 font-sans text-[11px] font-medium',
        className,
      )}
    >
      {children}
    </kbd>
  )
}
