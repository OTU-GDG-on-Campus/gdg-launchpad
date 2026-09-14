// Placeholder accounts used while auth is stubbed. Delete once Supabase sessions are live.

import type { User } from '@/types'

export const DEMO_USER: User = {
  id: 'user-demo-student',
  email: 'demo.student@ontariotechu.net',
  name: 'Demo Student',
  avatarUrl: null,
  role: 'student',
  bannedAt: null,
}

export const DEMO_ADMIN: User = {
  id: 'user-demo-admin',
  email: 'demo.admin@ontariotechu.ca',
  name: 'Demo Admin',
  avatarUrl: null,
  role: 'admin',
  bannedAt: null,
}
