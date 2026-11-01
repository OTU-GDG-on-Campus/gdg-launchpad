// Shared real-email OTP flow with resend cooldown, refresh recovery, and accessible segmented inputs.

import { useEffect, useRef, useState, type SyntheticEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { isBackendConfigured } from '@/lib/api/client'
import type { AuthMode } from '@/lib/auth/auth-context'
import { useAuth } from '@/lib/auth/useAuth'
import { isAllowedStudentEmail, allowedDomainsLabel } from '@/lib/auth/domain'
import { OtpInput } from './OtpInput'

interface EmailCodeFormProps {
  mode: AuthMode
  onVerified?: () => void
  onStepChange?: (step: number) => void
}

function rememberedChallenge(mode: AuthMode): { email: string; sentAt: number } | null {
  try {
    const value = JSON.parse(sessionStorage.getItem('launchpad:otp:' + mode) ?? 'null') as {
      email?: unknown
      sentAt?: unknown
    } | null
    return value &&
      typeof value.email === 'string' &&
      isAllowedStudentEmail(value.email) &&
      typeof value.sentAt === 'number' &&
      Date.now() - value.sentAt < 600_000
      ? { email: value.email, sentAt: value.sentAt }
      : null
  } catch {
    return null
  }
}

export function EmailCodeForm({ mode, onVerified, onStepChange }: EmailCodeFormProps) {
  const { sendCode, verifyCode } = useAuth()
  const [challenge] = useState(() => rememberedChallenge(mode))
  const [step, setStep] = useState<'email' | 'code'>(challenge ? 'code' : 'email')
  const [email, setEmail] = useState(challenge?.email ?? '')
  const [code, setCode] = useState('')
  const [sentAt, setSentAt] = useState(challenge?.sentAt ?? 0)
  const [now, setNow] = useState(Date.now)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const remaining = Math.max(0, Math.ceil((sentAt + 60_000 - now) / 1000))
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  useEffect(() => {
    onStepChange?.(step === 'email' ? 1 : 2)
    heading.current?.focus()
  }, [step, onStepChange])

  async function run(action: () => Promise<void>) {
    if (pending) return
    setPending(true)
    setError(null)
    setNotice(null)
    try {
      await action()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Something went wrong. Please retry.')
    } finally {
      setPending(false)
    }
  }
  async function send() {
    if (!isAllowedStudentEmail(email))
      throw new Error('Enter a valid university email: ' + allowedDomainsLabel())
    const timestamp = Date.now()
    await sendCode(email, mode)
    setSentAt(timestamp)
    setNow(timestamp)
    setCode('')
    setStep('code')
    try {
      sessionStorage.setItem('launchpad:otp:' + mode, JSON.stringify({ email, sentAt: timestamp }))
    } catch {
      /* Storage may be disabled; server-side session handling still works. */
    }
    setNotice('A new code is on its way. Check your inbox and junk folder.')
  }
  function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    void run(async () => {
      if (step === 'email') {
        await send()
        return
      }
      await verifyCode(email, code, mode)
      try {
        sessionStorage.removeItem('launchpad:otp:' + mode)
      } catch {
        /* Private browsing can disable session storage. */
      }
      onVerified?.()
    })
  }
  return (
    <form onSubmit={submit} className="mt-6 space-y-5">
      <h2 ref={heading} tabIndex={-1} className="text-xl font-semibold outline-none">
        {step === 'email' ? 'Your university email' : 'Check your inbox'}
      </h2>
      {!isBackendConfigured && (
        <p
          role="status"
          className="border-line bg-surface-raised text-ink-soft rounded-xl border p-4 text-sm"
        >
          Email authentication is not configured in this environment. The login page offers a
          separate demo account.
        </p>
      )}
      {error && (
        <p role="alert" className="border-danger text-danger rounded-xl border p-4 text-sm">
          {error}
        </p>
      )}
      {step === 'email' ? (
        <div>
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
            onChange={(event) => {
              setEmail(event.target.value)
              setError(null)
            }}
            disabled={pending}
            placeholder="name@ontariotechu.net"
            aria-describedby="email-help"
            aria-invalid={error ? true : undefined}
            className="border-line bg-surface-muted text-ink focus:ring-brand-500 mt-2 min-h-12 w-full rounded-xl border px-3 py-3 text-sm focus:ring-2 focus:outline-none"
          />
          <p id="email-help" className="text-ink-muted mt-2 text-xs">
            {allowedDomainsLabel()}. We will email a six-digit code.
          </p>
        </div>
      ) : (
        <>
          <p className="text-ink-soft text-sm leading-relaxed">
            Enter the six-digit code sent to <strong className="break-all">{email}</strong>. The
            code expires after 10 minutes.
          </p>
          <OtpInput
            value={code}
            onChange={(next) => {
              setCode(next)
              setError(null)
            }}
            disabled={pending}
            invalid={Boolean(error)}
          />
        </>
      )}
      {notice && (
        <p role="status" className="text-brand-700 text-sm">
          {notice}
        </p>
      )}
      <Button
        type="submit"
        size="lg"
        disabled={pending || !isBackendConfigured || (step === 'code' && code.length !== 6)}
        aria-busy={pending}
        className="w-full"
      >
        {pending
          ? step === 'email'
            ? 'Sending code...'
            : 'Verifying...'
          : step === 'email'
            ? 'Send verification code'
            : mode === 'register'
              ? 'Verify & continue'
              : 'Verify & sign in'}
      </Button>
      {step === 'code' && (
        <div className="flex flex-wrap justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            disabled={pending || remaining > 0}
            onClick={() => void run(send)}
          >
            {remaining > 0 ? 'Resend in ' + remaining + 's' : 'Resend code'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={() => {
              setStep('email')
              setError(null)
              setNotice(null)
              setCode('')
              try {
                sessionStorage.removeItem('launchpad:otp:' + mode)
              } catch {
                /* A blocked store does not prevent changing the address. */
              }
            }}
          >
            Change email
          </Button>
        </div>
      )}
    </form>
  )
}
