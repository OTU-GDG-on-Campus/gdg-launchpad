// Shared labeled text, select, and multiline fields with associated inline validation errors.

import { useId } from 'react'

interface ProfileFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  maxLength?: number
  multiline?: boolean
  options?: readonly string[]
  autoComplete?: string
  placeholder?: string
  type?: string
  hint?: string
}

export function ProfileField({
  label,
  value,
  onChange,
  error,
  required,
  maxLength,
  multiline,
  options,
  autoComplete,
  placeholder,
  type = 'text',
  hint,
}: ProfileFieldProps) {
  const id = useId()
  const props = {
    id,
    value,
    required,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error || hint ? `${id}-hint` : undefined,
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => onChange(event.target.value),
    className:
      'border-line bg-surface-muted text-ink focus:border-brand-500 focus:ring-brand-500 mt-2 min-h-12 w-full rounded-xl border px-3 py-3 text-sm focus:ring-2 focus:outline-none',
  }
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {!required && <span className="text-ink-muted font-normal"> (optional)</span>}
      </label>
      {options ? (
        <select {...props}>
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : multiline ? (
        <textarea {...props} maxLength={maxLength} rows={4} placeholder={placeholder} />
      ) : (
        <input
          {...props}
          type={type}
          maxLength={maxLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
        />
      )}
      {(error || hint) && (
        <p
          id={`${id}-hint`}
          className={error ? 'text-danger mt-2 text-xs' : 'text-ink-muted mt-2 text-xs'}
        >
          {error || hint}
        </p>
      )}
    </div>
  )
}
