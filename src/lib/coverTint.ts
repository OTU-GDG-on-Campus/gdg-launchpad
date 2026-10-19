// Cover art is optional, so projects without an image get a directional wash derived from their
// slug. The same slug always produces the same wash, so a project looks consistent across pages.

const COVER_TINTS = [
  'from-brand-500/30 via-brand-500/10 to-transparent',
  'from-accent/25 via-accent/8 to-transparent',
  'from-brand-700/25 via-brand-500/8 to-transparent',
  'from-flare/20 via-accent/8 to-transparent',
]

export function coverTint(slug: string): string {
  const sum = [...slug].reduce((total, char) => total + char.charCodeAt(0), 0)
  return COVER_TINTS[sum % COVER_TINTS.length]
}

/** First letters of the first two words of a title, used as the cover monogram. */
export function titleMonogram(title: string): string {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}
