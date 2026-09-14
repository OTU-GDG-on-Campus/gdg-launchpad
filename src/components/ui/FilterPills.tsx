// Single-select pill row, used for the project category filter.

import { cn } from '@/lib/cn'

interface FilterPillsProps<T extends string> {
  options: readonly T[]
  value: T
  onChange: (value: T) => void
  label: string
}

export function FilterPills<T extends string>({
  options,
  value,
  onChange,
  label,
}: FilterPillsProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={option === value}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
            option === value
              ? 'bg-brand-500 text-white'
              : 'border-line bg-surface text-ink-muted hover:text-ink border',
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
