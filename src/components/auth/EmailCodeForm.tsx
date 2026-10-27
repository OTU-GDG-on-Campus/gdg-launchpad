// Two-step sign-in form: asks for an Ontario Tech email, then the six digit code emailed to it.

import { useState, type SyntheticEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { isBackendConfigured } from '@/lib/api/client'
import { cn } from '@/lib/cn'
import type { AuthMode } from '@/lib/auth/auth-context'
import { useAuth } from '@/lib/auth/useAuth'

const FIELD_CLASS =
  'border-line bg-surface-muted text-ink focus:border-brand-700 mt-2 min-h-12 w-full rounded-lg border px-3 py-3 text-sm'

interface EmailCodeFormProps {
  mode: AuthMode
  onVerified?: () => void
}

export function EmailCodeForm({ mode, onVerified }: EmailCodeFormProps) {
  const { sendCode, verifyCode } = useAuth()
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function run(action: () => Promise<void>, fallback: string) {
    if (pending) return
    setError(null)
    setNotice(null)
    setPending(true)
    try {
      await action()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : fallback)
    } finally {
      setPending(false)
    }
  }

  function handleSendCode(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    void run(async () => {
      await sendCode(email, mode)
      setCode('')
      setStep('code')
    }, 'Could not send the code. Try again.')
  }

  function handleVerify(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    void run(async () => {
      await verifyCode(email, code, mode)
      onVerified?.()
    }, 'Could not verify the code. Try again.')
  }

  function handleResend() {
    void run(async () => {
      await sendCode(email, mode)
      setNotice('A new code is on its way.')
    }, 'Could not send the code. Try again.')
  }

  function handleChangeEmail() {
    setStep('email')
    setError(null)
    setNotice(null)
  }

  return (
    <div className="mt-6">
      {!isBackendConfigured && (
        <p className="border-line bg-surface-raised text-ink-muted mb-5 rounded-lg border p-3 text-xs leading-relaxed">
          Demo preview: no email is sent. Use any Ontario Tech address and any six digits.
        </p>
      )}
      {error && (
        <p role="alert" className="border-flare text-ink mb-5 rounded-lg border p-3 text-sm">
          {error}
        </p>
      )}

      {step === 'email' ? (
        <form onSubmit={handleSendCode}>
          <label htmlFor="sign-in-email" className="text-sm font-semibold">
            Ontario Tech email
          </label>
          <input
            id="sign-in-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@ontariotechu.net"
            className={FIELD_CLASS}
          />
          <Button
            type="submit"
            size="lg"
            disabled={pending}
            aria-busy={pending}
            className="mt-4 w-full"
          >
            {pending ? 'Sending code...' : 'Email me a code'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <p className="text-ink-soft text-sm leading-relaxed">
            We sent a six digit code to <strong className="break-all">{email}</strong>. It expires
            in 10 minutes. Check your junk folder if it does not arrive.
          </p>
          <label htmlFor="sign-in-code" className="mt-4 block text-sm font-semibold">
            Sign-in code
          </label>
          <input
            id="sign-in-code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            className={cn(FIELD_CLASS, 'font-mono tracking-widest')}
          />
          {notice && (
            <p role="status" className="text-ink-muted mt-3 text-xs">
              {notice}
            </p>
          )}
          <Button
            type="submit"
            size="lg"
            disabled={pending || code.length !== 6}
            aria-busy={pending}
            className="mt-4 w-full"
          >
            {pending ? 'Checking...' : 'Verify and sign in'}
          </Button>
          <div className="mt-4 flex flex-wrap justify-between gap-3 text-sm">
            <button
              type="button"
              onClick={handleResend}
              disabled={pending}
              className="text-brand-700 hover:text-flare font-semibold disabled:opacity-50"
            >
              Send a new code
            </button>
            <button
              type="button"
              onClick={handleChangeEmail}
              className="text-ink-muted hover:text-ink"
            >
              Use a different email
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
