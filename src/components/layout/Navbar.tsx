// Shared navigation: home wordmark, primary links, the global search trigger, theme toggle,
// and auth control.

import { NavLink } from 'react-router'
import { AuthControl } from '@/components/auth/AuthControl'
import { Kbd } from '@/components/ui/Kbd'
import { Wordmark } from '@/components/ui/Logo'
import { NAV_LINKS } from '@/config/site'
import { cn } from '@/lib/cn'
import { commandKeyLabel } from '@/lib/platform'
import { ThemeToggle } from './ThemeToggle'

interface NavbarProps {
  onOpenSearch: () => void
}

export function Navbar({ onOpenSearch }: NavbarProps) {
  return (
    <header className="border-line bg-surface-muted/95 sticky top-0 z-50 border-b backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex min-h-16 max-w-335 flex-wrap items-center gap-x-5 gap-y-2 px-6 py-3 sm:px-11"
      >
        <NavLink to="/" aria-label="LaunchPad home" className="shrink-0">
          <Wordmark />
        </NavLink>

        <ul className="order-last flex w-full flex-wrap items-center gap-1 xl:order-none xl:ml-1 xl:w-auto">
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
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search projects"
            title={`Search projects (${commandKeyLabel()} K)`}
            className="border-line bg-surface text-ink-muted hover:border-ink-muted hover:text-ink hidden items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors sm:inline-flex"
          >
            <svg viewBox="0 0 20 20" aria-hidden className="h-4 w-4 fill-current">
              <path d="M8.5 3a5.5 5.5 0 1 0 3.4 9.8l3.4 3.4a1 1 0 0 0 1.4-1.4l-3.4-3.4A5.5 5.5 0 0 0 8.5 3Zm0 2a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z" />
            </svg>
            Search
            <Kbd>{commandKeyLabel()} K</Kbd>
          </button>
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search projects"
            className="text-ink-muted hover:bg-surface hover:text-ink rounded-lg p-2 transition-colors sm:hidden"
          >
            <svg viewBox="0 0 20 20" aria-hidden className="h-5 w-5 fill-current">
              <path d="M8.5 3a5.5 5.5 0 1 0 3.4 9.8l3.4 3.4a1 1 0 0 0 1.4-1.4l-3.4-3.4A5.5 5.5 0 0 0 8.5 3Zm0 2a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z" />
            </svg>
          </button>
          <ThemeToggle />
          <AuthControl />
        </div>
      </nav>
    </header>
  )
}
