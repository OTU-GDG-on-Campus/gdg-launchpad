// Accessible six-digit OTP input with paste, autofill, arrow keys, and automatic focus advancement.

import { useId, useRef } from 'react'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  invalid?: boolean
}

export function OtpInput({ value, onChange, disabled, invalid }: OtpInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  const id = useId()
  function fill(text: string, index: number) {
    const digits = text.replace(/\D/g, '')
    if (!digits) return
    const start = digits.length === 6 ? 0 : index
    const next = `${value.slice(0, start)}${digits}${value.slice(start + digits.length)}`.slice(
      0,
      6,
    )
    onChange(next)
    inputs.current[Math.min(start + digits.length, 5)]?.focus()
  }
  return (
    <fieldset disabled={disabled}>
      <legend className="text-sm font-semibold">Six-digit verification code</legend>
      <div className="mt-3 flex gap-2 sm:gap-3">
        {Array.from({ length: 6 }, (_, index) => (
          <input
            key={index}
            ref={(element) => {
              inputs.current[index] = element
            }}
            id={`${id}-${index}`}
            aria-label={`Code digit ${index + 1}`}
            aria-invalid={invalid || undefined}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            value={value[index] ?? ''}
            disabled={disabled}
            className="border-line bg-surface-muted text-ink focus:border-brand-500 focus:ring-brand-500 h-14 w-full min-w-0 rounded-xl border text-center font-mono text-xl focus:ring-2 focus:outline-none"
            onChange={(event) =>
              event.target.value ? fill(event.target.value, index) : onChange(value.slice(0, index))
            }
            onFocus={(event) => event.currentTarget.select()}
            onPaste={(event) => {
              event.preventDefault()
              fill(event.clipboardData.getData('text'), index)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Backspace') {
                event.preventDefault()
                onChange(value.slice(0, value[index] ? index : Math.max(0, index - 1)))
                inputs.current[Math.max(0, index - 1)]?.focus()
              }
              if (event.key === 'ArrowLeft') {
                event.preventDefault()
                inputs.current[Math.max(0, index - 1)]?.focus()
              }
              if (event.key === 'ArrowRight') {
                event.preventDefault()
                inputs.current[Math.min(5, index + 1)]?.focus()
              }
            }}
          />
        ))}
      </div>
    </fieldset>
  )
}
