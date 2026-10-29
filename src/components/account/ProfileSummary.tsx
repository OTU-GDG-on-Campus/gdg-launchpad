// Public-only profile presentation reused by previews, owner pages, and shareable profiles.

import { Avatar } from '@/components/ui/Avatar'
import { normalizeLink } from '@/lib/onboarding'
import type { PublicProfile } from '@/types'
import { PlatformIcon } from './PlatformIcon'

export function ProfileSummary({ profile }: { profile: PublicProfile }) {
  const developer = profile.developer
  const groups = [
    { label: 'Languages', items: developer?.languages },
    { label: 'Frameworks', items: developer?.frameworks },
    { label: 'Tools', items: developer?.tools },
    { label: 'Skills', items: profile.skills },
    { label: 'Interests', items: developer?.interests },
    { label: 'Roles', items: developer?.roles },
  ]
  const links = (profile.links ?? [])
    .filter((link) => link.isPublic)
    .flatMap((link) => {
      try {
        return [normalizeLink(link)]
      } catch {
        return []
      }
    })
  return (
    <section
      aria-label="Profile details"
      className="border-line bg-surface mb-8 overflow-hidden rounded-2xl border"
    >
      {developer?.bannerUrl ? (
        <img src={developer.bannerUrl} alt="" className="aspect-[3/1] w-full object-cover" />
      ) : (
        <div className="discovery-hero border-line h-28 border-b sm:h-40" aria-hidden="true" />
      )}
      <div className="p-5 sm:p-8">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={profile.name} src={profile.avatarUrl} size="xl" />
          <div className="min-w-0">
            <h2 className="text-2xl font-bold tracking-tight break-words">{profile.name}</h2>
            <p className="text-ink-muted mt-1 text-sm">
              {[
                profile.program,
                profile.studyYear,
                developer?.graduationYear ? 'Class of ' + developer.graduationYear : '',
              ]
                .filter(Boolean)
                .join(' · ') || 'Student builder'}
            </p>
          </div>
        </div>
        {developer?.headline && (
          <p className="text-brand-700 mt-5 font-semibold">{developer.headline}</p>
        )}
        {developer?.introduction && (
          <p className="text-ink-soft mt-4 text-sm leading-relaxed whitespace-pre-wrap">
            {developer.introduction}
          </p>
        )}
        <p className="text-ink-soft mt-4 max-w-2xl text-sm leading-relaxed whitespace-pre-wrap">
          {profile.bio || 'Still writing the next chapter.'}
        </p>
        {groups
          .filter((group) => group.items?.length)
          .map((group) => (
            <div key={group.label} className="mt-5">
              <h3 className="text-ink-muted mb-2 text-xs font-semibold uppercase">{group.label}</h3>
              <ul aria-label={group.label} className="flex flex-wrap gap-2">
                {group.items?.map((item) => (
                  <li
                    key={item}
                    className="bg-brand-50 text-brand-700 rounded-lg px-3 py-1.5 text-xs font-medium"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        {Boolean(developer?.collaboration.length) && (
          <div className="border-line mt-6 border-t pt-5">
            <h3 className="mb-3 text-sm font-semibold">Let's build together</h3>
            <ul className="space-y-2">
              {developer?.collaboration.map((item) => (
                <li key={item} className="text-ink-soft text-sm">
                  <span aria-hidden="true" className="text-brand-700 mr-2">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        {links.length > 0 && (
          <ul aria-label="Public social links" className="mt-6 flex flex-wrap gap-2">
            {links.map((link) => (
              <li key={link.id}>
                {link.platform === 'discord' ? (
                  <span
                    className="border-line inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm"
                    title="Discord username"
                  >
                    <PlatformIcon platform={link.platform} />
                    {link.value}
                  </span>
                ) : (
                  <a
                    href={link.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label + ' (opens in a new tab)'}
                    className="border-line text-brand-700 hover:bg-brand-50 inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm"
                  >
                    <PlatformIcon platform={link.platform} />
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
        {!links.length && profile.githubUrl && (
          <a
            href={profile.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-700 mt-5 inline-flex min-h-10 items-center text-sm font-semibold"
          >
            GitHub profile &#8599;
          </a>
        )}
      </div>
    </section>
  )
}
