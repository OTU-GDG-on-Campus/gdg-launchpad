// Consistent title and supporting copy for personal workspace screens.

interface AccountPageHeaderProps {
  eyebrow: string
  title: string
  description: string
}

export function AccountPageHeader({ eyebrow, title, description }: AccountPageHeaderProps) {
  return (
    <header className="mb-8">
      <p className="text-flare mb-3 font-mono text-xs tracking-widest uppercase">{eyebrow}</p>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="text-ink-muted mt-4 max-w-2xl text-sm leading-relaxed">{description}</p>
    </header>
  )
}
