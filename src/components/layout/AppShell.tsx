// Shared frame: full-width home, account, and auth pages, full-bleed projects, centered content
// elsewhere. The global command palette mounts here so Ctrl+K works on every route.

import { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { CommandPalette } from '@/components/projects/CommandPalette'
import { cn } from '@/lib/cn'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

const FULL_WIDTH_ROUTES = [
  '/',
  '/login',
  '/register',
  '/signup',
  '/profile',
  '/dashboard',
  '/contributors',
]

export function AppShell() {
  const pathname = useLocation().pathname.replace(/\/+$/, '') || '/'
  const isFullWidthPage = FULL_WIDTH_ROUTES.includes(pathname)
  const isBleedPage = pathname === '/projects'

  const [searchOpen, setSearchOpen] = useState(false)
  const openSearch = useCallback(() => setSearchOpen(true), [])
  const closeSearch = useCallback(() => setSearchOpen(false), [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((current) => !current)
      }
    }
    // Pages ask for the palette through this event, so no prop has to cross the router outlet.
    function onOpenSearch() {
      setSearchOpen(true)
    }
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('launchpad:open-search', onOpenSearch)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('launchpad:open-search', onOpenSearch)
    }
  }, [])

  return (
    <div className={cn('flex min-h-screen flex-col', isFullWidthPage && 'landing-theme')}>
      <Navbar onOpenSearch={openSearch} />
      <main
        className={cn(
          'w-full flex-1',
          !isFullWidthPage && !isBleedPage && 'mx-auto max-w-6xl px-4 py-10',
        )}
      >
        <Outlet />
      </main>
      <Footer />
      <CommandPalette open={searchOpen} onClose={closeSearch} />
    </div>
  )
}
