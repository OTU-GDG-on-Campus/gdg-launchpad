// Shared frame: full-width home, account, and auth pages, full-bleed projects and sprints, centered content
// elsewhere. Resets page scroll on navigation and mounts the global command palette.

import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
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
  const { pathname: routePathname, hash } = useLocation()
  const pathname = routePathname.replace(/\/+$/, '') || '/'
  useLayoutEffect(() => {
    const target = hash ? document.getElementById(hash.slice(1)) : null
    if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' })
    else window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  useEffect(() => {
    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    return () => {
      window.history.scrollRestoration = previous
    }
  }, [])

  const isFullWidthPage = FULL_WIDTH_ROUTES.includes(pathname)
  const isBleedPage = pathname === '/projects' || pathname === '/sprints'

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
    <div
      className={cn(
        'flex min-h-screen flex-col',
        isFullWidthPage && 'landing-theme',
        pathname === '/sprints' && 'sprint-shell',
      )}
    >
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
