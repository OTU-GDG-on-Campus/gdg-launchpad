// Shared frame: full-width home and auth pages, centered content on other routes.

import { Outlet, useLocation } from 'react-router'
import { cn } from '@/lib/cn'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

const FULL_WIDTH_ROUTES = ['/', '/login', '/register', '/signup']

export function AppShell() {
  const pathname = useLocation().pathname.replace(/\/+$/, '') || '/'
  const isFullWidthPage = FULL_WIDTH_ROUTES.includes(pathname)

  return (
    <div className={cn('flex min-h-screen flex-col', isFullWidthPage && 'landing-theme')}>
      <Navbar />
      <main className={cn('w-full flex-1', !isFullWidthPage && 'mx-auto max-w-6xl px-4 py-10')}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
