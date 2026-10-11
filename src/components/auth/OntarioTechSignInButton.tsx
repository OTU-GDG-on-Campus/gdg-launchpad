// Shared Ontario Tech sign-in button with a pending state for the auth pages.

interface OntarioTechSignInButtonProps {
  pending: boolean
  onClick: () => void
  label?: string
}

export function OntarioTechSignInButton({
  pending,
  onClick,
  label = 'Continue with Ontario Tech',
}: OntarioTechSignInButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-busy={pending}
      className="border-line bg-surface text-ink hover:border-brand-700 mt-6 flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-60"
    >
      <svg
        viewBox="0 0 18 18"
        aria-hidden="true"
        className="text-brand-700 h-5 w-5 shrink-0 fill-current"
      >
        <path d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.5h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.6Z" />
        <path d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3A9 9 0 0 0 9 18Z" />
        <path d="M3.9 10.7a5.4 5.4 0 0 1 0-3.4V5H.9a9 9 0 0 0 0 8l3-2.3Z" />
        <path d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6A9 9 0 0 0 .9 5l3 2.3C4.6 5.1 6.6 3.6 9 3.6Z" />
      </svg>
      {pending ? 'Signing in...' : label}
    </button>
  )
}
