// Single source of truth for site-wide constants: branding, nav, footer, and auth domain rules.

/** Only Google accounts on these domains may sign in, since both require the OTU student portal. */
export const ALLOWED_EMAIL_DOMAINS = ['ontariotechu.net', 'ontariotechu.ca'] as const

export const SITE = {
  name: 'OTU LaunchPad',
  shortName: 'LaunchPad',
  tagline: 'See what Ontario Tech students are building.',
  organization: 'GDG on Campus, Ontario Tech University',
  /** Shown in the footer. LaunchPad is a student club project, not a university service. */
  disclaimer:
    'An independent project by a student club. Not affiliated with, endorsed by, or an official service of Ontario Tech University.',
  discordUrl: 'https://discord.gg/your-invite',
  githubUrl: 'https://github.com/gdg-otu/launchpad',
} as const

import type { ProjectCategory } from '@/types'

export const PROJECT_CATEGORIES: readonly ProjectCategory[] = [
  'Web App',
  'Mobile App',
  'AI/ML',
  'Game Dev',
  'Data Science',
  'DevOps',
  'Other',
]

/** "All" is the default filter state, so it leads the pill row but is not a real category. */
export const CATEGORY_FILTERS = ['All', ...PROJECT_CATEGORIES] as const

export interface NavLink {
  label: string
  to: string
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Semester Sprints', to: '/sprints' },
  { label: 'Projects', to: '/projects' },
  { label: 'Contribute', to: '/contribute' },
  { label: 'About', to: '/about' },
]

export interface FooterGroup {
  heading: string
  links: (NavLink & { external?: boolean })[]
}

export const FOOTER_GROUPS: FooterGroup[] = [
  {
    heading: 'Platform',
    links: [
      { label: 'Projects', to: '/projects' },
      { label: 'Semester Sprints', to: '/sprints' },
      { label: 'Post a project', to: '/submit' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { label: 'Contribute', to: '/contribute' },
      { label: 'GitHub', to: SITE.githubUrl, external: true },
      { label: 'Discord', to: SITE.discordUrl, external: true },
    ],
  },
  {
    heading: 'About',
    links: [{ label: 'What is LaunchPad', to: '/about' }],
  },
]
