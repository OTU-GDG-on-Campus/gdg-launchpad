// Cycles the theme preference: dark, light, then system. The icon reflects the applied theme,
// and a small dot marks when the system preference is driving it.

import { THEME_ORDER } from '@/lib/theme/theme-context'
import { useTheme } from '@/lib/theme/useTheme'

const LABELS = {
  dark: 'dark mode',
  light: 'light mode',
  system: 'your device theme',
} as const

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()

  const next = THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length]

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      title={`Theme: ${LABELS[theme]}. Switch to ${LABELS[next]}.`}
      aria-label={`Theme: ${LABELS[theme]}. Switch to ${LABELS[next]}.`}
      className="text-ink-muted hover:bg-surface hover:text-ink relative rounded-lg p-2 transition-colors"
    >
      <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-current">
        {resolvedTheme === 'dark' ? (
          <path d="M21 13.3A9 9 0 0 1 10.7 3a9 9 0 1 0 10.3 10.3Z" />
        ) : (
          <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0-5a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1Zm0 17a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0v-2a1 1 0 0 1 1-1ZM3 11h2a1 1 0 0 1 0 2H3a1 1 0 0 1 0-2Zm16 0h2a1 1 0 0 1 0 2h-2a1 1 0 0 1 0-2ZM5.6 4.2l1.4 1.4A1 1 0 0 1 5.6 7L4.2 5.6a1 1 0 0 1 1.4-1.4Zm11.4 11.4 1.4 1.4a1 1 0 0 1-1.4 1.4L15.6 17a1 1 0 0 1 1.4-1.4ZM18.4 4.2a1 1 0 0 1 1.4 1.4L18.4 7A1 1 0 0 1 17 5.6l1.4-1.4ZM7 15.6A1 1 0 0 1 8.4 17L7 18.4a1 1 0 0 1-1.4-1.4L7 15.6Z" />
        )}
      </svg>
      {theme === 'system' && (
        <span
          aria-hidden
          className="bg-accent absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full"
        />
      )}
    </button>
  )
}
