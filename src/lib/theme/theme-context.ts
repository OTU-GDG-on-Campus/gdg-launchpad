// Theme context shape shared by ThemeProvider and the useTheme hook.

import { createContext } from 'react'

/** What the visitor chose. 'system' follows the operating system preference. */
export type ThemePreference = 'dark' | 'light' | 'system'

export type ResolvedTheme = 'dark' | 'light'

export interface ThemeContextValue {
  theme: ThemePreference
  /** The theme actually applied to the document, with 'system' resolved. */
  resolvedTheme: ResolvedTheme
  setTheme: (theme: ThemePreference) => void
}

export const THEME_STORAGE_KEY = 'launchpad-theme'

export const THEME_ORDER: ThemePreference[] = ['dark', 'light', 'system']

export const ThemeContext = createContext<ThemeContextValue | null>(null)
