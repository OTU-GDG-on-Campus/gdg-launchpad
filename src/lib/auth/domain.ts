// Email syntax and domain checks for UX. Auth triggers and database policies enforce access.

import { ALLOWED_EMAIL_DOMAINS } from '@/config/site'

export function getEmailDomain(email: string): string {
  return email.trim().toLowerCase().split('@').at(-1) ?? ''
}

export function isAllowedStudentEmail(email: string): boolean {
  return (
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    (ALLOWED_EMAIL_DOMAINS as readonly string[]).includes(getEmailDomain(email))
  )
}

export function allowedDomainsLabel(): string {
  return ALLOWED_EMAIL_DOMAINS.map((domain) => `@${domain}`).join(' or ')
}
