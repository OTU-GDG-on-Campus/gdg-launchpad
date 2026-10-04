// Shared footer: brand, navigation groups, club ownership, and affiliation disclaimer.

import { Link } from 'react-router'
import { Wordmark } from '@/components/ui/Logo'
import { FOOTER_GROUPS, SITE } from '@/config/site'

const LINK_CLASS = 'text-ink-soft hover:text-brand-700 text-sm transition-colors'

export function Footer() {
  return (
    <footer className="border-line bg-surface-raised mt-20 border-t">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" aria-label="LaunchPad home" className="inline-flex">
              <Wordmark />
            </Link>
            <p className="text-ink-muted mt-3 font-mono text-xs">Build. Share. Launch.</p>
          </div>

          {FOOTER_GROUPS.map((group) => (
            <div key={group.heading}>
              <h2 className="text-ink-muted mb-4 font-mono text-xs tracking-widest uppercase">
                {group.heading}
              </h2>

              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a href={link.to} target="_blank" rel="noreferrer" className={LINK_CLASS}>
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.to} className={LINK_CLASS}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-ink-muted mt-12 space-y-3 text-xs leading-relaxed">
          <p className="max-w-2xl">{SITE.disclaimer}</p>
          <p className="font-mono">
            &copy; {new Date().getFullYear()} {SITE.organization}. Built by students in Oshawa,
            Canada.
          </p>
        </div>
      </div>
    </footer>
  )
}
