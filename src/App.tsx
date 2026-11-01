// Public routes and protected personal workspace inside shared theme and authentication providers.

import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AccountLayout } from '@/components/account/AccountLayout'
import { MyProjectsPage } from '@/pages/account/MyProjectsPage'
import { SavedProjectsPage } from '@/pages/account/SavedProjectsPage'
import { MyProfilePage } from '@/pages/account/MyProfilePage'
import { PublicProfilePage } from '@/pages/account/PublicProfilePage'
import { EditProfilePage } from '@/pages/account/EditProfilePage'
import { AccountSettingsPage } from '@/pages/account/AccountSettingsPage'
import { MySprintsPage } from '@/pages/account/MySprintsPage'
import { MyActivityPage } from '@/pages/account/MyActivityPage'
import { NotificationsPage } from '@/pages/account/NotificationsPage'

import { AppShell } from '@/components/layout/AppShell'
import { AuthProvider } from '@/lib/auth/AuthProvider'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'
import { AboutPage } from '@/pages/AboutPage'
import { AdminPage } from '@/pages/admin/AdminPage'
import { ContributePage } from '@/pages/ContributePage'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProjectDetailPage } from '@/pages/projects/ProjectDetailPage'
import { ProjectsPage } from '@/pages/projects/ProjectsPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { SprintDetailPage } from '@/pages/sprints/SprintDetailPage'
import { SprintsPage } from '@/pages/sprints/SprintsPage'
import { SubmitProjectPage } from '@/pages/projects/SubmitProjectPage'

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
