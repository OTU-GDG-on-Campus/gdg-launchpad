// Surface container used by project and sprint cards.

import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('border-line bg-surface rounded-xl border p-5', className)}>{children}</div>
  )
}
