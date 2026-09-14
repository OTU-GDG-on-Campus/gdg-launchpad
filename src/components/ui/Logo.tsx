// LaunchPad wordmark and mark. Deliberately original art: no Ontario Tech logo is used anywhere.

import { cn } from '@/lib/cn'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn('h-6 w-6', className)}>
      <path d="M12 2.5 19 19l-7-4-7 4 7-16.5Z" className="fill-brand-700" />
      <path d="M12 2.5 19 19l-7-4V2.5Z" className="fill-accent" />
    </svg>
  )
}

/** size="hero" renders the large display wordmark used at the top of the home page. */
export function Wordmark({ size = 'nav' }: { size?: 'nav' | 'hero' }) {
  const isHero = size === 'hero'

  return (
    <span
      className={cn('font-semibold tracking-tight', isHero ? 'text-4xl sm:text-6xl' : 'text-base')}
    >
      <span className="text-brand-700">OTU</span> <span className="text-flare">Launch</span>
      <span className="text-ink">Pad</span>
    </span>
  )
}
