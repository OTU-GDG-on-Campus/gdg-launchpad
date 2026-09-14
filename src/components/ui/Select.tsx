// Labelled native select. Native keeps keyboard and mobile behaviour correct for free.

interface SelectOption<T extends string> {
  value: T
  label: string
}

interface SelectProps<T extends string> {
  options: readonly SelectOption<T>[]
  value: T
  onChange: (value: T) => void
  label: string
}

export function Select<T extends string>({ options, value, onChange, label }: SelectProps<T>) {
  return (
    <label className="border-line bg-surface text-ink-muted inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="text-ink cursor-pointer bg-transparent font-medium outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-surface">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
