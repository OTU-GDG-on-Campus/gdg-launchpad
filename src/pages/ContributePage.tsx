// Explains how students can contribute, both to other projects and to LaunchPad itself.

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { SITE } from '@/config/site'

const WAYS = [
  {
    title: 'Help on a student project',
    detail:
      'Projects marked open to contributions are looking for people. Pick one, read the repo, and open a pull request.',
  },
  {
    title: 'Build LaunchPad itself',
    detail:
      'This site is open source and maintained by the club. Good first issues are labelled in the tracker.',
  },
  {
    title: 'Join a Semester Sprint',
    detail:
      'Three weeks, a theme, and workshops to get you started. Everyone who finishes gets a certificate.',
  },
]

export function ContributePage() {
  return (
    <>
      <PageHeader
        title="Contribute"
        description="Every project here was started by a student. Most of them could use help."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {WAYS.map((way) => (
          <Card key={way.title}>
            <h2 className="font-semibold">{way.title}</h2>
            <p className="text-ink-muted mt-1 text-sm">{way.detail}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button href={SITE.githubUrl}>Open the GitHub repo</Button>
        <Button variant="secondary" href={SITE.discordUrl}>
          Join the Discord
        </Button>
      </div>
    </>
  )
}
