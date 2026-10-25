// Base demo identities used only by the unconfigured, browser-local preview.

import type { User } from '@/types'

export const DEMO_USER: User = {
  id: 'user-demo-student',
  email: 'demo.student@ontariotechu.net',
  name: 'Demo Student',
  avatarUrl: null,
  role: 'student',
  bannedAt: null,
  registeredAt: '2026-09-01T00:00:00.000Z',
}

export const DEMO_ADMIN: User = {
  id: 'user-demo-admin',
  email: 'demo.admin@ontariotechu.ca',
  name: 'Demo Admin',
  avatarUrl: null,
  role: 'admin',
  bannedAt: null,
  registeredAt: '2026-09-01T00:00:00.000Z',
}
