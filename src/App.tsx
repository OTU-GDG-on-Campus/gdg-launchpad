// App entrypoint: theme and auth providers, shared layout, and every page route.

import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { AuthProvider } from '@/lib/auth/AuthProvider'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'
import { AboutPage } from '@/pages/AboutPage'
import { AdminPage } from '@/pages/AdminPage'
import { ContributePage } from '@/pages/ContributePage'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProjectDetailPage } from '@/pages/ProjectDetailPage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { SprintDetailPage } from '@/pages/SprintDetailPage'
import { SprintsPage } from '@/pages/SprintsPage'
import { SubmitProjectPage } from '@/pages/SubmitProjectPage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="signup" element={<Navigate to="/register" replace />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/:slug" element={<ProjectDetailPage />} />
              <Route path="sprints" element={<SprintsPage />} />
              <Route path="sprints/:slug" element={<SprintDetailPage />} />
              <Route path="submit" element={<SubmitProjectPage />} />
              <Route path="contribute" element={<ContributePage />} />
              <Route path="admin" element={<AdminPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
