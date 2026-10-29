// Shared domain types for public discovery, private account pages, and profile inputs.

export type UserRole = 'visitor' | 'student' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  role: UserRole
  bannedAt: string | null
  /** Null until the student finishes creating their account after verifying their email. */
  registeredAt: string | null
}

/** What a student fills in to finish creating their account. */
export interface RegistrationDetails {
  name: string
  program: string
  studyYear: string
  skills: string[]
  bio: string
}

export type ProjectStatus = 'pending' | 'approved' | 'rejected'

export type ProjectCategory =
  'Web App' | 'Mobile App' | 'AI/ML' | 'Game Dev' | 'Data Science' | 'DevOps' | 'Other'

/** Someone who has contributed to a project, shown as an avatar cluster on the project card. */
export interface Contributor {
  id: string
  name: string
  avatarUrl: string | null
  /** What they worked on, for example "Backend support". Null when unspecified. */
  role: string | null
}

export interface Project {
  id: string
  slug: string
  title: string
  summary: string
  description: string
  category: ProjectCategory
  tags: string[]
  repoUrl: string | null
  liveUrl: string | null
  coverImageUrl: string | null
  screenshotUrls: string[]
  authorId: string
  authorName: string
  authorAvatarUrl: string | null
  /** Short author byline, for example "CS Year 3". Null when unspecified. */
  authorHeadline: string | null
  /** Set when the project was built for a sprint, null for independent submissions. */
  sprintId: string | null
  status: ProjectStatus
  upvoteCount: number
  /** Whether the signed-in viewer has already upvoted. False for signed-out visitors. */
  viewerHasUpvoted: boolean
  commentCount: number
  openToContributions: boolean
  contributors: Contributor[]
  createdAt: string
}

export interface ProjectQuery {
  sort?: ProjectSort
  sprintId?: string
  category?: ProjectCategory | 'All'
  search?: string
  /** Every listed technology must appear in the project's tags. */
  technologies?: string[]
  openToContributions?: boolean
  page?: number
  perPage?: number
}

export interface ProjectPage {
  projects: Project[]
  totalCount: number
  pageCount: number
  page: number
}

export type SprintStatus = 'upcoming' | 'active' | 'completed'

/** A Semester Sprint: a time-boxed themed build event with workshops. */
export interface Sprint {
  id: string
  slug: string
  title: string
  theme: string
  description: string
  status: SprintStatus
  startDate: string
  endDate: string
  /** Populated once the sprint ends and the montage is published. */
  montageUrl: string | null
  projectCount: number
}

/** Trending ranks by recent engagement, top by total upvotes, new by creation date. */
export type ProjectSort = 'trending' | 'top' | 'new'

export interface TechnologyFacet {
  name: string
  projectCount: number
}

/** An admin-picked project shown above the feed, valid for a date window. */
export interface FeaturedSelection {
  project: Project
  startsAt: string
  endsAt: string
}

/** Public details about a builder, shown when their name or avatar is selected. */
export interface PersonPreview {
  name: string
  avatarUrl: string | null
  /** Academic program or year, for example "CS Year 3". Null when unspecified. */
  headline: string | null
  /** What they did on the project the preview was opened from. Null for project authors. */
  roleOnProject: string | null
  projectCount: number
}

export interface Comment {
  id: string
  projectId: string
  authorId: string
  authorName: string
  authorAvatarUrl: string | null
  body: string
  createdAt: string
}

/** Public profile fields. Account email and privileges never belong in this shape. */
export interface PublicProfile {
  id: string
  name: string
  avatarUrl: string | null
  program: string
  studyYear: string
  skills: string[]
  bio: string
  githubUrl: string | null
  developer?: DeveloperProfile
  links?: ProfileLink[]
}

export interface AccountProfile extends PublicProfile {
  email: string
  onboarding?: OnboardingDetails
}

export type ProfileMediaKind = 'avatar' | 'banner'

export interface ProfileLink {
  id: string
  platform: string
  label: string
  value: string
  isPublic: boolean
}

export interface DeveloperProfile {
  headline: string
  introduction: string
  graduationYear: string
  languages: string[]
  frameworks: string[]
  tools: string[]
  interests: string[]
  roles: string[]
  collaboration: string[]
  avatarPath: string | null
  bannerPath: string | null
  bannerUrl: string | null
}

export interface OnboardingDetails extends DeveloperProfile {
  firstName: string
  lastName: string
  displayName: string
  program: string
  studyYear: string
  bio: string
  skills: string[]
  links: ProfileLink[]
  avatarUrl: string | null
}

export interface OnboardingDraft {
  details: OnboardingDetails
  step: number
  revision: number
}

export interface ProfileDetails extends RegistrationDetails {
  githubUrl: string
}

export interface ActivityItem {
  id: string
  kind: 'project' | 'bookmark' | 'upvote' | 'comment'
  projectId: string
  title: string
  slug: string
  createdAt: string
}
