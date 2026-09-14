// Text input with a leading search icon.

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label: string
}

export function SearchInput({ value, onChange, placeholder, label }: SearchInputProps) {
  return (
    <div className="relative w-full max-w-sm">
      <svg
        viewBox="0 0 20 20"
        aria-hidden
        className="text-ink-muted pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 fill-current"
      >
        <path d="M8.5 3a5.5 5.5 0 1 0 3.4 9.8l3.4 3.4a1 1 0 0 0 1.4-1.4l-3.4-3.4A5.5 5.5 0 0 0 8.5 3Zm0 2a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z" />
      </svg>
      <input
        type="search"
        aria-label={label}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="border-line bg-surface text-ink placeholder:text-ink-muted focus:border-brand-500 h-10 w-full rounded-lg border pr-3 pl-9 text-sm transition-colors outline-none"
      />
    </div>
  )
}
