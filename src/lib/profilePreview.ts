// Shared limits and safe LinkedIn normalization for private browser profile previews.

import { normalizeLink } from '@/lib/onboarding'

export const MAX_PINNED_PROJECTS = 3

export function normalizePreviewLinkedIn(value: string): string {
  if (!value.trim()) return ''
  return normalizeLink({
    id: 'preview-linkedin',
    platform: 'linkedin',
    label: 'LinkedIn',
    value,
    isPublic: false,
  }).value
}
