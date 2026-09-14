// Title, optional description, and a slot for page-level actions.

import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-ink-muted mt-1 max-w-2xl text-sm">{description}</p>}
      </div>
      {actions}
    </header>
  )
}
