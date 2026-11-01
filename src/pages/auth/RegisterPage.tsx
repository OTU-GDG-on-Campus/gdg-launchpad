// Seven-step signup separates email verification from private, resumable developer onboarding.

import { useState } from 'react'
import { Link } from 'react-router'
import { EmailCodeForm } from '@/components/auth/EmailCodeForm'
import { ProfileWizard } from '@/components/onboarding/ProfileWizard'
import { LoadingState } from '@/components/ui/PageState'
import { Wordmark } from '@/components/ui/Logo'
import { useAuth } from '@/lib/auth/useAuth'

export function RegisterPage() {
  const { user, status, error } = useAuth()
  const [step, setStep] = useState(1)
  return (
    <section
      aria-label="Join LaunchPad"
      className="landing-grid border-line border-b px-4 py-10 sm:px-6 sm:py-16"
    >
      <div className="border-line bg-surface mx-auto w-full max-w-3xl rounded-3xl border p-5 shadow-lg sm:p-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Wordmark />
          <Link to="/login" className="text-ink-soft text-sm">
            Already a member? <span className="text-brand-700 font-semibold">Sign in</span>
          </Link>
        </div>
        {error && (
          <p role="alert" className="border-danger mb-5 rounded-xl border p-4 text-sm">
            {error}
          </p>
        )}
        {status === 'loading' ? (
          <LoadingState label="Checking your session" />
        ) : user?.bannedAt ? (
          <p role="alert">
            This account is unavailable. Contact the LaunchPad coordinators for help.
          </p>
        ) : user ? (
          <ProfileWizard key={user.id} />
        ) : (
          <>
            <p className="text-brand-700 font-mono text-xs tracking-widest uppercase">
              Create account · Step {step} of 7
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Your next chapter starts here.
            </h1>
            <p className="text-ink-soft mt-4 max-w-xl text-sm leading-relaxed">
              A community for Ontario Tech students who build. Verify your email, introduce
              yourself, and find your people.
            </p>
            <progress
              aria-label="Registration progress"
              max={7}
              value={step}
              className="onboarding-progress mt-6 h-1.5 w-full"
            />
            <EmailCodeForm mode="register" onStepChange={setStep} />
          </>
        )}
      </div>
    </section>
  )
}
