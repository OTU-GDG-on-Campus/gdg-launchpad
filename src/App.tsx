// Public routes and protected personal workspace inside shared theme and authentication providers.

import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AccountLayout } from '@/components/account/AccountLayout'
import { MyProjectsPage } from '@/pages/MyProjectsPage'
import { SavedProjectsPage } from '@/pages/SavedProjectsPage'
import { MyProfilePage } from '@/pages/MyProfilePage'
import { PublicProfilePage } from '@/pages/PublicProfilePage'
import { EditProfilePage } from '@/pages/EditProfilePage'
import { AccountSettingsPage } from '@/pages/AccountSettingsPage'
import { MySprintsPage } from '@/pages/MySprintsPage'
import { MyActivityPage } from '@/pages/MyActivityPage'
import { NotificationsPage } from '@/pages/NotificationsPage'

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
              <Route path="u/:id" element={<PublicProfilePage />} />
              <Route path="me" element={<AccountLayout />}>
                <Route index element={<Navigate to="projects" replace />} />
                <Route path="projects" element={<MyProjectsPage />} />
                <Route path="saved" element={<SavedProjectsPage />} />
                <Route path="profile" element={<MyProfilePage />} />
                <Route path="settings" element={<AccountSettingsPage />} />
                <Route path="settings/profile" element={<EditProfilePage />} />
                <Route path="sprints" element={<MySprintsPage />} />
                <Route path="activity" element={<MyActivityPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
