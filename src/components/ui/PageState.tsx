// Loading, error, and empty placeholders shared by every page.

import type { ReactNode } from 'react'

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="border-line bg-surface text-ink-muted rounded-xl border border-dashed p-12 text-center text-sm">
      {children}
    </div>
  )
}

export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return <Frame>{label}...</Frame>
}

export function ErrorState({ error }: { error: Error }) {
  return <Frame>Something went wrong: {error.message}</Frame>
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <Frame>
      <p className="text-ink font-medium">{title}</p>
      {hint && <p className="mt-1">{hint}</p>}
    </Frame>
  )
}
