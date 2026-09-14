// Page frame shared by every route: navbar, centered content column, footer.

import { Outlet } from 'react-router'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
