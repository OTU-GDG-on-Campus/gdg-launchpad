// Shared navigation: home wordmark, primary links, theme toggle, and auth control.

import { NavLink } from 'react-router'
import { AuthControl } from '@/components/auth/AuthControl'
import { Wordmark } from '@/components/ui/Logo'
import { NAV_LINKS } from '@/config/site'
import { cn } from '@/lib/cn'
import { ThemeToggle } from './ThemeToggle'

export function Navbar() {
  return (
    <header className="border-line bg-surface-raised/95 sticky top-0 z-50 border-b backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6"
      >
        <NavLink to="/" aria-label="LaunchPad home" className="shrink-0">
          <Wordmark />
        </NavLink>

        <ul className="order-last flex w-full flex-wrap items-center gap-1 md:order-none md:ml-4 md:w-auto">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'inline-flex rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'text-brand-700' : 'text-ink-soft hover:text-ink',
                  )
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <AuthControl />
        </div>
      </nav>
    </header>
  )
}
