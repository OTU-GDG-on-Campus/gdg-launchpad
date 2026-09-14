// Explains what LaunchPad is, what students get out of it, and the rules for posting.

import { PageHeader } from '@/components/ui/PageHeader'
import { SITE } from '@/config/site'
import { allowedDomainsLabel } from '@/lib/auth/domain'

const RULES = [
  'Anyone can browse. No account needed.',
  `Posting and upvoting need an Ontario Tech account (${allowedDomainsLabel()}).`,
  'A coordinator reviews every submission before it goes live.',
]

export function AboutPage() {
  return (
    <>
      <PageHeader title={`What is ${SITE.name}?`} />

      <p className="max-w-3xl text-base leading-relaxed">
        Good projects die quietly. Students lose momentum without feedback, or never post at all
        because they assume nobody will look. LaunchPad gives that work a home. Post a project here
        and it lands in front of the people most likely to care: other Ontario Tech students who
        know what it took to build, and employers who come looking for what this school actually
        produces. Browsing works the same way in reverse. You see what people around you are
        building, how they pulled it off, and which projects are open to help. Mark your own open to
        contributions and the people who turn up already share the interest. There is no downvote
        anywhere on this site. The only thing anyone can do to your project is push it higher.
      </p>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold">How it works</h2>
        <ul className="text-ink-muted space-y-2 text-sm">
          {RULES.map((rule) => (
            <li key={rule} className="flex gap-2">
              <span aria-hidden className="text-brand-500">
                &bull;
              </span>
              {rule}
            </li>
          ))}
        </ul>
        <p className="text-ink-muted mt-6 text-sm">Built and maintained by {SITE.organization}.</p>
      </section>
    </>
  )
}
