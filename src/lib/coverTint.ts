// Cover art is optional, so projects without an image get a gradient derived from their slug.
// The same slug always produces the same tint, so a project looks consistent across pages.

const COVER_TINTS = [
  'from-brand-500/40 to-accent/15',
  'from-accent/35 to-brand-700/15',
  'from-flare/25 to-brand-500/25',
  'from-brand-700/30 to-accent/10',
]

export function coverTint(slug: string): string {
  const sum = [...slug].reduce((total, char) => total + char.charCodeAt(0), 0)
  return COVER_TINTS[sum % COVER_TINTS.length]
}
