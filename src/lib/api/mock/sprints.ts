// Placeholder Semester Sprint records. Replace with real rows once the sprints table exists.

import type { Sprint } from '@/types'

export const MOCK_SPRINTS: Sprint[] = [
  {
    id: 'sprint-discord-bot',
    slug: 'discord-bot',
    title: 'Discord Bot Sprint',
    theme: 'Discord.js',
    description:
      'Build a Discord bot in three weeks. Workshops cover slash commands, event handling, and deploying a bot that stays online.',
    status: 'active',
    startDate: '2026-10-05',
    endDate: '2026-10-23',
    montageUrl: null,
    projectCount: 1,
  },
  {
    id: 'sprint-gemini-api',
    slug: 'gemini-api',
    title: 'Gemini API Sprint',
    theme: 'AI and APIs',
    description:
      'Ship something powered by the Gemini API. Workshops cover prompting, structured output, and wiring a model into a real interface.',
    status: 'upcoming',
    startDate: '2026-11-09',
    endDate: '2026-11-27',
    montageUrl: null,
    projectCount: 1,
  },
  {
    id: 'sprint-creative-design',
    slug: 'creative-design',
    title: 'Creative Expression and Design Sprint',
    theme: 'Design and frontend',
    description:
      'The open sprint. No exam pressure and the loosest constraints of the year, judged on craft and originality.',
    status: 'upcoming',
    startDate: '2027-02-01',
    endDate: '2027-02-26',
    montageUrl: null,
    projectCount: 0,
  },
]
