// Searchable skill choices with native button semantics and keyboard-friendly custom additions.

import { useId, useState } from 'react'
import { cn } from '@/lib/cn'

interface SkillSelectProps {
  label: string
  options: string[]
  value: string[]
  onChange: (items: string[]) => void
  error?: string
}

export function SkillSelect({ label, options, value, onChange, error }: SkillSelectProps) {
  const [search, setSearch] = useState('')
  const id = useId()
  const choices = [...new Set([...options, ...value])].filter((item) =>
    item.toLowerCase().includes(search.toLowerCase()),
  )
  const custom = search.trim()
  const canAdd =
    custom &&
    custom.length <= 40 &&
    !choices.some((item) => item.toLowerCase() === custom.toLowerCase())
  function toggle(item: string) {
    onChange(value.includes(item) ? value.filter((old) => old !== item) : [...value, item])
  }
  function add() {
    if (canAdd && value.length < 20) {
      onChange([...value, custom])
      setSearch('')
    }
  }
  return (
    <fieldset className="border-line rounded-xl border p-4">
      <legend className="px-1 text-sm font-semibold">
        {label} <span className="text-ink-muted font-normal">{value.length}/20</span>
      </legend>
      <label htmlFor={id} className="sr-only">
        Search or add {label.toLowerCase()}
      </label>
      <input
        id={id}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        maxLength={40}
        placeholder={`Search or add ${label.toLowerCase()}`}
        className="border-line bg-surface-muted focus:ring-brand-500 mb-3 min-h-11 w-full rounded-lg border px-3 text-sm focus:ring-2 focus:outline-none"
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            add()
          }
        }}
      />
      <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
        {choices.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={value.includes(item)}
            disabled={!value.includes(item) && value.length >= 20}
            onClick={() => toggle(item)}
            className={cn(
              'min-h-10 rounded-lg border px-3 py-2 text-xs transition-colors disabled:opacity-50',
              value.includes(item)
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-line text-ink-soft hover:border-brand-500',
            )}
          >
            {value.includes(item) && <span aria-hidden="true">✓ </span>}
            {item}
          </button>
        ))}
        {canAdd && (
          <button
            type="button"
            disabled={value.length >= 20}
            onClick={add}
            className="text-brand-700 min-h-10 rounded-lg border border-dashed px-3 text-xs disabled:opacity-50"
          >
            Add “{custom}”
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-danger mt-2 text-xs">
          {error}
        </p>
      )}
    </fieldset>
  )
}
