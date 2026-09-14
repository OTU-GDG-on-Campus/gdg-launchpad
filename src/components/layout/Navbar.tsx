// Top navigation: mark and wordmark, primary links, theme toggle, and the auth control.

import { NavLink } from 'react-router'
import { NAV_LINKS } from '@/config/site'
import { cn } from '@/lib/cn'
import { AuthControl } from '@/components/auth/AuthControl'
import { LogoMark, Wordmark } from '@/components/ui/Logo'
import { ThemeToggle } from './ThemeToggle'

export function Navbar() {
  return (
    <header className="border-line bg-surface-raised/80 sticky top-0 z-10 border-b backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <NavLink to="/" className="flex items-center gap-2">
          <LogoMark className="h-5 w-5" />
          <Wordmark />
        </NavLink>

        <ul className="ml-auto hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'text-brand-700' : 'text-ink-muted hover:text-ink',
                  )
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <ThemeToggle />
          <AuthControl />
        </div>
      </nav>
    </header>
  )
}
