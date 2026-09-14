// Previous, numbered pages, Next. Renders nothing when there is only one page.

import { cn } from '@/lib/cn'

interface PaginationProps {
  page: number
  pageCount: number
  onChange: (page: number) => void
}

const BASE = 'h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition-colors'

export function Pagination({ page, pageCount, onChange }: PaginationProps) {
  if (pageCount <= 1) return null

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1)

  return (
    <nav aria-label="Pagination" className="flex justify-center gap-2">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className={cn(
          BASE,
          'border-line bg-surface text-ink border disabled:pointer-events-none disabled:opacity-40',
        )}
      >
        Previous
      </button>

      {pages.map((number) => (
        <button
          key={number}
          type="button"
          onClick={() => onChange(number)}
          aria-current={number === page ? 'page' : undefined}
          className={cn(
            BASE,
            number === page
              ? 'bg-brand-500 text-white'
              : 'border-line bg-surface text-ink-muted hover:text-ink border',
          )}
        >
          {number}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === pageCount}
        className={cn(
          BASE,
          'border-line bg-surface text-ink border disabled:pointer-events-none disabled:opacity-40',
        )}
      >
        Next
      </button>
    </nav>
  )
}
