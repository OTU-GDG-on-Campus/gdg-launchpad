// Email domain rules for student sign-in. The browser copy is a UX guard only.
//
// SECURITY: anything a client sends can be forged. The real check is the sign-up trigger on
// auth.users, which runs in the database. See docs/auth.md.

import { ALLOWED_EMAIL_DOMAINS } from '@/config/site'

export function getEmailDomain(email: string): string {
  return email.trim().toLowerCase().split('@').at(-1) ?? ''
}

export function isAllowedStudentEmail(email: string): boolean {
  return (ALLOWED_EMAIL_DOMAINS as readonly string[]).includes(getEmailDomain(email))
}

export function allowedDomainsLabel(): string {
  return ALLOWED_EMAIL_DOMAINS.map((domain) => `@${domain}`).join(' or ')
}
