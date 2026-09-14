// Theme context shape shared by ThemeProvider and the useTheme hook.

import { createContext } from 'react'

export type Theme = 'dark' | 'light'

export interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

export const THEME_STORAGE_KEY = 'launchpad-theme'

export const ThemeContext = createContext<ThemeContextValue | null>(null)
