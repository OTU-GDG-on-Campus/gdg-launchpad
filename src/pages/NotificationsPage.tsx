// Honest notification placeholder until event delivery and read tracking are implemented.

import { Link } from 'react-router'
import { AccountPageHeader } from '@/components/account/AccountPageHeader'

export function NotificationsPage() {
  return (
    <>
      <AccountPageHeader
        eyebrow="Stay in the loop"
        title="Notifications"
        description="A future home for the updates that matter to your projects."
      />
      <section className="border-line bg-surface rounded-2xl border px-6 py-12 text-center sm:px-10">
        <span
          aria-hidden="true"
          className="bg-brand-50 text-brand-700 mx-auto flex size-14 items-center justify-center rounded-2xl font-mono text-2xl"
        >
          ...
        </span>
        <h2 className="mt-6 text-2xl font-semibold tracking-tight">
          Updates are still taking shape.
        </h2>
        <p className="text-ink-muted mx-auto mt-4 max-w-md text-sm leading-relaxed">
          Notifications are not connected yet. There are no email alerts or unread counts to manage.
          For now, check your project statuses and recent activity directly.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            to="/me/projects"
            className="bg-brand-500 text-on-brand inline-flex min-h-11 items-center rounded-lg px-5 text-sm font-semibold"
          >
            View my projects
          </Link>
          <Link
            to="/me/activity"
            className="border-line inline-flex min-h-11 items-center rounded-lg border px-5 text-sm font-semibold"
          >
            View my activity
          </Link>
        </div>
      </section>
    </>
  )
}
