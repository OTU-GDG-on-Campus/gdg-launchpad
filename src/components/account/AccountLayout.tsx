// Protected personal workspace with responsive account navigation and an explicit demo banner.

import { NavLink, Outlet } from 'react-router'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { Avatar } from '@/components/ui/Avatar'
import { ACCOUNT_LINKS } from '@/config/account'
import { isBackendConfigured } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/useAuth'
import { cn } from '@/lib/cn'

export function AccountLayout() {
  const { user } = useAuth()
  return (
    <RequireAuth>
      <div className="border-line mb-8 flex flex-wrap items-end justify-between gap-4 border-b pb-7">
        <div>
          <p className="text-brand-700 mb-2 font-mono text-xs tracking-widest uppercase">
            Your LaunchPad
          </p>
          <p className="text-2xl font-bold tracking-tight">A home for your next chapter.</p>
        </div>
        <p className="text-ink-muted text-sm">Build. Collect ideas. Keep moving.</p>
      </div>
      {!isBackendConfigured && (
        <p className="border-line bg-accent-soft text-ink-soft mb-6 rounded-xl border px-5 py-4 text-sm leading-relaxed">
          <strong>Demo workspace.</strong> Sample data is saved only in this browser. No university
          account has been verified. Reset it anytime in Settings.
        </p>
      )}
      <div className="grid gap-8 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-10">
        <aside>
          <div className="mb-5 hidden items-center gap-3 lg:flex">
            <Avatar name={user?.name ?? 'Student'} src={user?.avatarUrl} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user?.name}</p>
              <p className="text-ink-muted text-xs">Student workspace</p>
            </div>
          </div>
          <nav
            aria-label="Your account"
            className="flex flex-wrap gap-2 lg:sticky lg:top-24 lg:flex-col"
          >
            {ACCOUNT_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-10 items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                    isActive
                      ? 'border-line bg-brand-50 text-brand-700 font-semibold'
                      : 'text-ink-muted hover:bg-surface hover:text-ink border-transparent',
                  )
                }
              >
                <span aria-hidden="true" className="hidden font-mono text-[10px] lg:inline">
                  {link.mark}
                </span>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="min-w-0" key={user?.id}>
          <Outlet />
        </div>
      </div>
    </RequireAuth>
  )
}
