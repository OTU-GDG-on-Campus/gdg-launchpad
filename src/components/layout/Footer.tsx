// Site footer: link groups, ownership, and the disclaimer that this is not a university service.

import { Link } from 'react-router'
import { FOOTER_GROUPS, SITE } from '@/config/site'
import { LogoMark, Wordmark } from '@/components/ui/Logo'

const LINK_CLASS = 'text-ink-muted hover:text-ink text-sm transition-colors'

export function Footer() {
  return (
    <footer className="border-line bg-surface-raised mt-20 border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[2fr_3fr]">
        <div>
          <div className="flex items-center gap-2">
            <LogoMark className="h-5 w-5" />
            <Wordmark />
          </div>
          <p className="text-ink-muted mt-3 max-w-sm text-sm">
            A student-run showcase for projects built by Ontario Tech students.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {FOOTER_GROUPS.map((group) => (
            <div key={group.heading}>
              <h2 className="text-ink mb-3 text-sm font-semibold">{group.heading}</h2>
              <ul className="space-y-2">
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
      </div>

      <div className="border-line border-t">
        <div className="text-ink-muted mx-auto max-w-6xl space-y-2 px-4 py-6 text-xs">
          <p>{SITE.disclaimer}</p>
          <p>
            &copy; {new Date().getFullYear()} {SITE.organization}. Built by students in Oshawa,
            Canada.
          </p>
        </div>
      </div>
    </footer>
  )
}
