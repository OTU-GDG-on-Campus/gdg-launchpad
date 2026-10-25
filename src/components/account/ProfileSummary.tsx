// Public-only profile presentation, reused by the owner preview and shareable profile.

import { Avatar } from '@/components/ui/Avatar'
import type { PublicProfile } from '@/types'

export function ProfileSummary({ profile }: { profile: PublicProfile }) {
  return (
    <section
      aria-label="Profile details"
      className="border-line bg-surface mb-8 overflow-hidden rounded-2xl border"
    >
      <div className="discovery-hero border-line h-20 border-b sm:h-28" aria-hidden="true" />
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={profile.name} src={profile.avatarUrl} size="lg" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{profile.name}</h2>
            <p className="text-ink-muted mt-1 text-sm">
              {[profile.program, profile.studyYear].filter(Boolean).join(' � ') ||
                'Student builder'}
            </p>
          </div>
        </div>
        <p className="text-ink-soft mt-6 max-w-2xl text-sm leading-relaxed whitespace-pre-wrap">
          {profile.bio || 'Still writing the next chapter.'}
        </p>
        {profile.skills.length > 0 && (
          <ul aria-label="Skills" className="mt-5 flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <li
                key={skill}
                className="bg-brand-50 text-brand-700 rounded-lg px-3 py-1.5 text-xs font-medium"
              >
                {skill}
              </li>
            ))}
          </ul>
        )}
        {profile.githubUrl && (
          <a
            href={profile.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="text-brand-700 mt-5 inline-flex min-h-10 items-center text-sm font-semibold"
          >
            GitHub profile &#8599;
          </a>
        )}
      </div>
    </section>
  )
}
