// Shared page frame: full-width landing page and centered content for all other routes.

import { Outlet, useLocation } from 'react-router'
import { cn } from '@/lib/cn'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

export function AppShell() {
  const isLandingPage = useLocation().pathname === '/'

  return (
    <div className={cn('flex min-h-screen flex-col', isLandingPage && 'landing-theme')}>
      <Navbar />
      <main className={cn('w-full flex-1', !isLandingPage && 'mx-auto max-w-6xl px-4 py-10')}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
