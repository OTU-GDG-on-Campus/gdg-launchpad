// Holds the active theme and writes it to the root element, where the CSS tokens key off it.
// 'system' follows the OS preference live; a stored choice survives reloads, and index.html
// applies the same preference before first paint so the page never flashes the wrong theme.

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  THEME_STORAGE_KEY,
  ThemeContext,
  type ResolvedTheme,
  type ThemeContextValue,
  type ThemePreference,
} from './theme-context'

const DARK_QUERY = '(prefers-color-scheme: dark)'

function readStoredTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
  } catch {
    return 'system'
  }
}

function systemTheme(): ResolvedTheme {
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemePreference>(readStoredTheme)
  const [systemResolved, setSystemResolved] = useState<ResolvedTheme>(systemTheme)

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY)
    const onChange = () => setSystemResolved(media.matches ? 'dark' : 'light')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemResolved : theme

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
  }, [resolvedTheme])

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // A browser blocking site data is not a reason to break the page.
    }
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
