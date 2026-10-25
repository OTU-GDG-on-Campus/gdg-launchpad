// Keeps existing About links working after moving the content onto the landing page.

import { Navigate } from 'react-router'

export function AboutPage() {
  return <Navigate to="/#about" replace />
}
