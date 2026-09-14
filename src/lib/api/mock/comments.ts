// Placeholder discussion threads. Replace with the comments table once it exists.

import type { Comment } from '@/types'

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'comment-1',
    projectId: 'project-ridgeback-scheduler',
    authorId: 'user-1',
    authorName: 'David Kim',
    authorAvatarUrl: null,
    body: 'This would have saved me a full weekend last September. Does it handle the labs that run every other week?',
    createdAt: '2026-09-12T14:02:00.000Z',
  },
  {
    id: 'comment-2',
    projectId: 'project-ridgeback-scheduler',
    authorId: 'user-2',
    authorName: 'Emily Souza',
    authorAvatarUrl: null,
    body: 'Ranking by latest start time is a nice touch. Any plan to factor in walking time between buildings?',
    createdAt: '2026-09-11T09:30:00.000Z',
  },
  {
    id: 'comment-3',
    projectId: 'project-ridgeback-scheduler',
    authorId: 'user-3',
    authorName: 'Marcus Lee',
    authorAvatarUrl: null,
    body: 'Solid work. Happy to help port the solver to a web worker so the UI stops locking up on big inputs.',
    createdAt: '2026-09-09T17:45:00.000Z',
  },
  {
    id: 'comment-4',
    projectId: 'project-lab-queue',
    authorId: 'user-4',
    authorName: 'Ana Petrova',
    authorAvatarUrl: null,
    body: 'We tried something like this on paper last term and it fell apart by week three. Glad someone built the real thing.',
    createdAt: '2026-09-10T11:20:00.000Z',
  },
]
