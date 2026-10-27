// Introduces LaunchPad's student-led mission, community principles, and ways to get involved.

import { Link } from 'react-router'
import { isBackendConfigured } from '@/lib/api/client'
import { SITE } from '@/config/site'
import { allowedDomainsLabel } from '@/lib/auth/domain'

const PRIMARY_LINK =
  'bg-brand-500 text-on-brand hover:bg-brand-600 inline-flex min-h-12 items-center justify-center gap-3 rounded-lg px-6 py-3 text-sm font-semibold transition-colors'
const SECONDARY_LINK =
  'border-line bg-surface text-ink hover:border-brand-700 inline-flex min-h-12 items-center justify-center gap-3 rounded-lg border px-6 py-3 text-sm font-semibold transition-colors'

const POSSIBILITIES = [
  {
    number: '01',
    title: 'Find your next rabbit hole.',
    description:
      'Explore student-built apps, games, experiments, and tools. See the ideas and technologies that people around you are working with.',
    label: 'Explore projects',
    to: '/projects',
  },
  {
    number: '02',
    title: 'Build something together.',
    description:
      'Look for projects open to contributions. Read the repository, find a problem that interests you, and bring your perspective to the team.',
    label: 'Find ways to contribute',
    to: '/contribute',
  },
  {
    number: '03',
    title: 'Make room for a new idea.',
    description:
      'Need a reason to start? Semester Sprints bring a theme and a shared challenge to help turn curiosity into something you can show.',
    label: 'Discover Semester Sprints',
    to: '/sprints',
  },
]

const PRINCIPLES = [
  {
    title: 'Open to explore',
    description:
      'Anyone can browse the gallery. No account or university email needed to look around.',
  },
  {
    title: 'Rooted in the student community',
    description:
      'Posting, upvoting, and commenting are reserved for verified Ontario Tech students who have completed registration.',
  },
  {
    title: 'Encouragement by design',
    description:
      'Upvotes only. There is no downvote, and the default gallery puts the most upvoted projects first.',
  },
  {
    title: 'Reviewed before going public',
    description:
      'Every submitted project needs a coordinator review before appearing in the public feed.',
  },
]

const QUESTIONS = [
  {
    question: 'Who is LaunchPad for?',
    answer:
      'Ontario Tech students building things, students looking for collaborators, and anyone curious about their work. Course projects, side projects, and experiments all have a place here.',
  },
  {
    question: 'How does student verification work?',
    answer: `Student access requires an emailed code sent to an address on ${allowedDomainsLabel()}, followed by a finished registration. Browsing does not require verification.`,
  },
  {
    question: 'Can I post a project right now?',
    answer: isBackendConfigured
      ? 'Project submissions are still being built. You can explore published projects, save your favorites, and upvote the work you like after completing registration.'
      : 'Project submissions are still being built. This preview uses demonstration data, including projects and upvotes. Try the demo account to explore your personal workspace.',
  },
  {
    question: 'Can I help build LaunchPad?',
    answer:
      'Yes. LaunchPad is open source and maintained by the club. Visit the Contribute page to find the repository and learn how to get involved.',
  },
]

export function AboutPage() {
  return (
    <div className="space-y-16 pb-6 sm:space-y-20">
      <section
        aria-labelledby="about-title"
        className="discovery-hero border-line overflow-hidden rounded-2xl border"
      >
        <div className="grid gap-10 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1.5fr_1fr] lg:items-end lg:gap-16">
          <div>
            <p className="text-brand-700 mb-5 font-mono text-xs tracking-widest uppercase">
              About {SITE.shortName}
            </p>
            <h1
              id="about-title"
              className="max-w-2xl text-4xl leading-tight font-bold tracking-tight sm:text-6xl"
            >
              Good projects deserve <span className="text-brand-700">more than a folder.</span>
            </h1>
            <p className="text-ink-soft mt-6 max-w-xl text-base leading-relaxed sm:text-lg">
              A home for what Ontario Tech students are building. Discover an idea, find your
              people, and give the work behind the screen a chance to be seen.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/projects" className={PRIMARY_LINK}>
                Explore projects <span aria-hidden="true">&#8599;</span>
              </Link>
              <Link to="/contribute" className={SECONDARY_LINK}>
                Get involved <span aria-hidden="true">+</span>
              </Link>
            </div>
          </div>
          <aside className="border-line bg-surface rounded-xl border p-6 sm:p-8">
            <p className="text-flare font-mono text-xs tracking-widest uppercase">
              Our starting point
            </p>
            <p className="mt-4 text-xl leading-relaxed font-medium">
              The project you built after class could be the reason someone else starts building.
            </p>
            <p className="text-ink-muted mt-5 text-sm leading-relaxed">
              A first prototype. A weekend experiment. Something you are still figuring out.
              Progress is worth sharing, too.
            </p>
          </aside>
        </div>
        <div className="border-line bg-surface/80 flex flex-wrap gap-x-8 gap-y-2 border-t px-6 py-4 font-mono text-xs sm:px-10">
          <span>Student-built</span>
          <span>Open source</span>
          <span>Independent by design</span>
        </div>
      </section>

      <section
        aria-labelledby="purpose-title"
        className="grid gap-6 md:grid-cols-[1fr_2fr] md:gap-12"
      >
        <h2 id="purpose-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
          From a local folder
          <br className="hidden md:block" /> to a shared starting point.
        </h2>
        <div className="text-ink-soft max-w-2xl space-y-4 text-base leading-relaxed">
          <p>
            Too much student work disappears after a deadline or a demo. The idea stays in a
            repository, the team moves on, and the next person who could learn from it never sees
            it.
          </p>
          <p>
            {SITE.shortName} gives that work a home beyond the hand-in. A place to see how other
            students approach problems, discover something worth contributing to, and turn
            individual effort into shared inspiration.
          </p>
        </div>
      </section>

      <section aria-labelledby="possibilities-title">
        <p className="text-flare mb-3 font-mono text-xs tracking-widest uppercase">
          Follow your curiosity
        </p>
        <h2 id="possibilities-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
          More than a place to scroll.
        </h2>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {POSSIBILITIES.map((item) => (
            <Link
              key={item.number}
              to={item.to}
              className="group border-line bg-surface hover:border-brand-700 flex flex-col rounded-xl border p-6 transition-colors sm:p-7"
            >
              <span className="text-brand-700 font-mono text-sm">{item.number}</span>
              <h3 className="mt-6 text-xl font-semibold tracking-tight">{item.title}</h3>
              <p className="text-ink-muted mt-3 flex-1 text-sm leading-relaxed">
                {item.description}
              </p>
              <span className="text-brand-700 mt-7 flex items-center justify-between gap-3 text-sm font-semibold">
                {item.label} <span aria-hidden="true">&#8599;</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="principles-title"
        className="border-line grid gap-8 border-y py-10 lg:grid-cols-[1fr_2fr] lg:gap-16"
      >
        <div>
          <p className="text-flare mb-3 font-mono text-xs tracking-widest uppercase">
            How we do things
          </p>
          <h2 id="principles-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
            A space to build each other up.
          </h2>
          <p className="text-ink-muted mt-4 text-sm leading-relaxed">
            These principles guide the platform as we build it.
          </p>
        </div>
        <dl className="grid gap-8 sm:grid-cols-2">
          {PRINCIPLES.map((principle) => (
            <div key={principle.title}>
              <dt className="font-semibold">{principle.title}</dt>
              <dd className="text-ink-muted mt-2 text-sm leading-relaxed">
                {principle.description}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        aria-labelledby="questions-title"
        className="grid gap-7 lg:grid-cols-[1fr_2fr] lg:gap-16"
      >
        <h2 id="questions-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
          A few things to know.
        </h2>
        <div className="divide-line border-line divide-y border-y">
          {QUESTIONS.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="marker:text-brand-700 cursor-pointer pr-3 font-semibold">
                {item.question}
              </summary>
              <p className="text-ink-muted mt-3 max-w-2xl text-sm leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="community-title"
        className="border-line bg-surface-raised rounded-2xl border p-6 sm:p-10"
      >
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl">
            <p className="text-flare mb-3 font-mono text-xs tracking-widest uppercase">
              Built here, together
            </p>
            <h2 id="community-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
              By students. For the next builder.
            </h2>
            <p className="text-ink-soft mt-4 text-sm leading-relaxed">
              Built and maintained by {SITE.organization}. Help shape the place where our community
              shares what comes next.
            </p>
          </div>
          <Link to="/projects" className={SECONDARY_LINK}>
            Find your next inspiration <span aria-hidden="true">&#8599;</span>
          </Link>
        </div>
        <p className="border-line text-ink-muted mt-8 border-t pt-5 text-xs leading-relaxed">
          {SITE.disclaimer}
        </p>
      </section>
    </div>
  )
}
