// Account identity, existing theme preferences, sign-out, and confirmed local-demo reset.

import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { AccountPageHeader } from '@/components/account/AccountPageHeader'
import { isBackendConfigured } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/useAuth'
import { useTheme } from '@/lib/theme/useTheme'
import type { ThemePreference } from '@/lib/theme/theme-context'

const THEMES: { value: ThemePreference; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'Follow system' },
]

export function AccountSettingsPage() {
  const { user, signOut, resetDemo } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [confirmReset, setConfirmReset] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function reset() {
    setPending(true)
    setError(null)
    try {
      await resetDemo()
      navigate('/me/projects')
    } catch {
      setError('Could not reset the demo. Try again.')
    } finally {
      setPending(false)
    }
  }
  async function leave() {
    setPending(true)
    try {
      await signOut()
      navigate('/')
    } catch {
      setError('Could not sign out. Check your connection and try again.')
    } finally {
      setPending(false)
    }
  }
  return (
    <>
      <AccountPageHeader
        eyebrow="Your preferences"
        title="Settings"
        description="Manage your public introduction and the way LaunchPad looks in this browser."
      />
      <div className="space-y-6">
        <section
          aria-labelledby="settings-account"
          className="border-line bg-surface rounded-xl border p-6"
        >
          <h2 id="settings-account" className="text-lg font-semibold">
            Account
          </h2>
          <p className="text-ink-muted mt-4 text-xs font-medium">Private email address</p>
          <p className="mt-1 text-sm break-all">{user?.email}</p>
          <p className="text-ink-muted mt-3 text-sm leading-relaxed">
            {isBackendConfigured
              ? 'You sign in with an emailed code. There is no password to change.'
              : 'This is a local demo identity, not a verified student account.'}{' '}
            Email changes and account deletion are not available here yet.
          </p>
          <Link
            to="/me/settings/profile"
            className="text-brand-700 mt-4 inline-flex min-h-10 items-center text-sm font-semibold"
          >
            Edit profile, images, skills &amp; social links &#8599;
          </Link>
        </section>
        <section
          aria-labelledby="settings-theme"
          className="border-line bg-surface rounded-xl border p-6"
        >
          <h2 id="settings-theme" className="text-lg font-semibold">
            Appearance
          </h2>
          <p className="text-ink-muted mt-2 text-sm">
            Saved in this browser and shared with the navbar theme control.
          </p>
          <fieldset className="mt-5 flex flex-wrap gap-3">
            <legend className="sr-only">Choose a theme</legend>
            {THEMES.map((option) => (
              <label
                key={option.value}
                className="border-line flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm"
              >
                <input
                  type="radio"
                  name="account-theme"
                  value={option.value}
                  checked={theme === option.value}
                  onChange={() => setTheme(option.value)}
                  className="accent-brand-700"
                />
                {option.label}
              </label>
            ))}
          </fieldset>
        </section>
        {!isBackendConfigured && (
          <section
            aria-labelledby="settings-demo"
            className="border-line bg-surface rounded-xl border p-6"
          >
            <h2 id="settings-demo" className="text-lg font-semibold">
              Demo data
            </h2>
            <p className="text-ink-muted mt-2 text-sm leading-relaxed">
              Restore the original sample profile, saved projects, and activity. This only changes
              demo data in this browser.
            </p>
            {confirmReset ? (
              <div className="border-line bg-surface-raised mt-5 rounded-lg border p-4">
                <p className="text-sm font-semibold">
                  Replace your local demo changes with the original samples?
                </p>
                <div className="mt-4 flex flex-wrap gap-4">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => void reset()}
                    className="bg-brand-500 text-on-brand min-h-10 rounded-lg px-4 py-2 text-sm font-semibold"
                  >
                    Reset demo data
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => setConfirmReset(false)}
                    className="text-ink-muted min-h-10 text-sm font-semibold"
                  >
                    Keep my changes
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="text-brand-700 mt-4 min-h-10 text-sm font-semibold"
              >
                Reset demo data
              </button>
            )}
          </section>
        )}
        <section aria-labelledby="settings-session" className="border-line rounded-xl border p-6">
          <h2 id="settings-session" className="text-lg font-semibold">
            Ready to step away?
          </h2>
          <p className="text-ink-muted mt-2 text-sm">End your session on this device.</p>
          <button
            type="button"
            disabled={pending}
            onClick={() => void leave()}
            className="border-line bg-surface mt-4 min-h-11 rounded-lg border px-5 text-sm font-semibold disabled:opacity-50"
          >
            Sign out
          </button>
        </section>
        {error && (
          <p role="alert" className="text-danger text-sm">
            {error}
          </p>
        )}
      </div>
    </>
  )
}
