// Guides students toward project contributions, sprint participation, and LaunchPad's source code.

import { Link } from 'react-router'
import { isBackendConfigured } from '@/lib/api/client'
import { SITE } from '@/config/site'

const PRIMARY_LINK =
  'bg-brand-500 text-on-brand hover:bg-brand-600 inline-flex min-h-12 items-center justify-center gap-3 rounded-lg px-6 py-3 text-sm font-semibold transition-colors'
const SECONDARY_LINK =
  'border-line bg-surface text-ink hover:border-brand-700 inline-flex min-h-12 items-center justify-center gap-3 rounded-lg border px-6 py-3 text-sm font-semibold transition-colors'

const WAYS = [
  {
    number: '01',
    eyebrow: 'Build on an idea',
    title: 'Help a student project grow.',
    detail:
      'Find projects marked open to contributions. Explore the stack, read the repository, and look for a small improvement you can make your own.',
    label: 'Find open projects',
    to: '/projects?contrib=1',
  },
  {
    number: '02',
    eyebrow: 'Start something together',
    title: 'Find a sprint that sparks something.',
    detail:
      'Explore themed building seasons and try a new technology alongside other students. Read the sprint details for the format and schedule.',
    label: 'Explore Semester Sprints',
    to: '/sprints',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Find something that interests you.',
    detail:
      'Choose a project you would enjoy using or learning from. Check whether the repository welcomes contributions and read its guidance.',
  },
  {
    number: '02',
    title: 'Agree on a small first step.',
    detail:
      'Read the existing issues before starting. Describe the change you have in mind and ask the maintainer whether it would be useful.',
  },
  {
    number: '03',
    title: 'Make it easy to review.',
    detail:
      'Keep your change focused. Test it, explain what changed, and include screenshots when you improve the interface.',
  },
]

const SKILLS = [
  {
    title: 'Code',
    detail: 'Fix a bug, improve a feature, or make a slow interaction feel faster.',
  },
  {
    title: 'Design',
    detail:
      'Clarify a flow, improve a small-screen layout, or make an interface easier to navigate.',
  },
  {
    title: 'Documentation',
    detail: 'Improve setup instructions, explain a confusing step, or add a useful example.',
  },
  {
    title: 'Testing and feedback',
    detail: 'Try a fresh install, reproduce an issue, or report a problem with clear steps.',
  },
]

const QUESTIONS = [
  {
    question: 'Do I need to be an experienced developer?',
    answer:
      'No. A clear bug report, a better README, or a thoughtful design suggestion can be a useful first contribution. Pick a task you can understand and ask questions when you need context.',
  },
  {
    question: 'Do I need a LaunchPad account?',
    answer:
      'Browsing projects and following their repository links does not require an account. Each repository has its own contribution process. Posting, upvoting, and commenting on LaunchPad require verified Ontario Tech student access and completed registration.',
  },
  {
    question: 'How do I know a project is looking for help?',
    answer: `Use the open-to-contributions filter in the project gallery, then check the project description and repository for current needs.${isBackendConfigured ? '' : ' This preview uses demonstration data, so confirm opportunities with the maintainer.'}`,
  },
  {
    question: 'Can I contribute to LaunchPad itself?',
    answer:
      'Yes. LaunchPad is open source and maintained by the student club. Start with CONTRIBUTING.md and AGENTS.md in the repository, then read the issue tracker and TODO.md for context before proposing a change.',
  },
]

export function ContributePage() {
  return (
    <div className="space-y-16 pb-6 sm:space-y-20">
      <section
        aria-labelledby="contribute-title"
        className="discovery-hero border-line overflow-hidden rounded-2xl border"
      >
        <div className="grid gap-10 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-brand-700 mb-5 font-mono text-xs tracking-widest uppercase">
              Contribute
            </p>
            <h1
              id="contribute-title"
              className="max-w-2xl text-4xl leading-tight font-bold tracking-tight sm:text-6xl"
            >
              You do not have to
              <br />
              start <span className="text-brand-700">from zero.</span>
            </h1>
            <p className="text-ink-soft mt-6 max-w-xl text-base leading-relaxed sm:text-lg">
              Someone has the idea. You might have the missing piece. Find a student project, bring
              what you know, and learn something new together.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/projects?contrib=1" className={PRIMARY_LINK}>
                Find a project to help <span aria-hidden="true">&#8599;</span>
              </Link>
              <a href="#first-contribution" className={SECONDARY_LINK}>
                Where do I start? <span aria-hidden="true">&#8595;</span>
              </a>
            </div>
          </div>
          <aside className="border-line bg-surface rounded-xl border p-6 sm:p-8">
            <p className="text-flare font-mono text-xs tracking-widest uppercase">
              Small changes count
            </p>
            <p className="mt-5 text-2xl leading-snug font-semibold tracking-tight">
              A clearer README.
              <br />A bug finally fixed.
              <br />
              <span className="text-brand-700">A fresh pair of eyes.</span>
            </p>
            <p className="border-line text-ink-muted mt-6 border-t pt-5 text-sm leading-relaxed">
              You do not need a big feature to make a useful contribution. Start with one thing you
              can help make better.
            </p>
          </aside>
        </div>
        <div className="border-line bg-surface/80 flex flex-wrap gap-x-8 gap-y-2 border-t px-6 py-4 font-mono text-xs sm:px-10">
          <span>Code</span>
          <span>Design</span>
          <span>Documentation</span>
          <span>Testing and feedback</span>
        </div>
      </section>

      <section aria-labelledby="ways-title">
        <p className="text-flare mb-3 font-mono text-xs tracking-widest uppercase">
          Choose your starting point
        </p>
        <h2 id="ways-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
          More than one way in.
        </h2>
        <div className="mt-7 grid gap-5 md:grid-cols-2">
          {WAYS.map((way) => (
            <Link
              key={way.number}
              to={way.to}
              className="border-line bg-surface hover:border-brand-700 flex flex-col rounded-xl border p-6 transition-colors sm:p-8"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-flare font-mono text-xs tracking-widest uppercase">
                  {way.eyebrow}
                </p>
                <span className="text-brand-700 font-mono text-lg">{way.number}</span>
              </div>
              <h3 className="mt-7 text-2xl font-semibold tracking-tight">{way.title}</h3>
              <p className="text-ink-muted mt-4 max-w-lg flex-1 text-sm leading-relaxed">
                {way.detail}
              </p>
              <span className="text-brand-700 mt-8 flex items-center justify-between gap-3 text-sm font-semibold">
                {way.label}
                <span aria-hidden="true">&#8599;</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section
        id="first-contribution"
        aria-labelledby="steps-title"
        className="border-line grid scroll-mt-24 gap-8 border-y py-10 lg:grid-cols-[1fr_2fr] lg:gap-16"
      >
        <div>
          <p className="text-flare mb-3 font-mono text-xs tracking-widest uppercase">
            Your first contribution
          </p>
          <h2 id="steps-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
            Start small.
            <br />
            Make it useful.
          </h2>
          <p className="text-ink-muted mt-4 max-w-sm text-sm leading-relaxed">
            A focused contribution is easier to finish, explain, and build on.
          </p>
        </div>
        <ol className="space-y-8">
          {STEPS.map((step) => (
            <li key={step.number} className="flex gap-5">
              <span className="text-brand-700 bg-brand-50 flex size-10 shrink-0 items-center justify-center rounded-lg font-mono text-sm">
                {step.number}
              </span>
              <div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-ink-muted mt-2 max-w-xl text-sm leading-relaxed">
                  {step.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="skills-title">
        <div className="max-w-2xl">
          <p className="text-flare mb-3 font-mono text-xs tracking-widest uppercase">
            Bring your perspective
          </p>
          <h2 id="skills-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
            Good projects need more than code.
          </h2>
          <p className="text-ink-muted mt-4 text-sm leading-relaxed">
            Use the skills you already have, or choose a small task that helps you practise
            something new.
          </p>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SKILLS.map((skill) => (
            <div key={skill.title} className="border-line rounded-xl border p-6">
              <h3 className="font-semibold">{skill.title}</h3>
              <p className="text-ink-muted mt-3 text-sm leading-relaxed">{skill.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="launchpad-contribution-title"
        className="border-line bg-surface-raised rounded-2xl border p-6 sm:p-10"
      >
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-flare mb-3 font-mono text-xs tracking-widest uppercase">
              Help shape this space
            </p>
            <h2
              id="launchpad-contribution-title"
              className="text-2xl font-bold tracking-tight sm:text-3xl"
            >
              LaunchPad is a student project, too.
            </h2>
            <p className="text-ink-soft mt-4 text-sm leading-relaxed">
              Built and maintained by {SITE.organization}. If you want to improve the place where
              our community shares its work, the source is open.
            </p>
          </div>
          <div className="border-line bg-surface rounded-xl border p-6">
            <p className="font-semibold">Before your first pull request</p>
            <p className="text-ink-muted mt-3 text-sm leading-relaxed">
              Read the contribution guide, set up the project locally, and choose a focused change
              from the backlog or issue tracker.
            </p>
            <a
              href={SITE.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="text-brand-700 mt-5 inline-flex min-h-10 items-center gap-3 text-sm font-semibold underline-offset-4 hover:underline"
            >
              Explore the repository <span aria-hidden="true">&#8599;</span>
            </a>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="contribute-questions-title"
        className="grid gap-7 lg:grid-cols-[1fr_2fr] lg:gap-16"
      >
        <h2
          id="contribute-questions-title"
          className="text-2xl font-bold tracking-tight sm:text-3xl"
        >
          Before you jump in.
        </h2>
        <div className="divide-line border-line divide-y border-y">
          {QUESTIONS.map((item) => (
            <details key={item.question} className="py-5">
              <summary className="marker:text-brand-700 cursor-pointer pr-3 font-semibold">
                {item.question}
              </summary>
              <p className="text-ink-muted mt-3 text-sm leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="contribute-cta-title"
        className="border-line flex flex-col items-start justify-between gap-6 rounded-2xl border border-dashed p-6 sm:p-10 md:flex-row md:items-center"
      >
        <div className="max-w-xl">
          <h2 id="contribute-cta-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
            Your next collaborator might already be here.
          </h2>
          <p className="text-ink-muted mt-4 text-sm leading-relaxed">
            Start with a project that interests you. See what it needs, and take it one useful step
            further.
          </p>
        </div>
        <Link to="/projects?contrib=1" className={PRIMARY_LINK}>
          Explore open projects <span aria-hidden="true">&#8599;</span>
        </Link>
      </section>
    </div>
  )
}
