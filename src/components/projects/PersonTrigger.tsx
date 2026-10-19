// A project author's name and avatar, which open their public profile preview.

import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/cn'
import { PersonPopover } from './PersonPopover'

interface PersonTriggerProps {
  name: string
  avatarUrl?: string | null
  profileId?: string | null
  /** Short program line, for example "CS Year 3". */
  headline?: string | null
  role?: string | null
  size?: 'sm' | 'md'
  className?: string
}

export function PersonTrigger({
  name,
  avatarUrl,
  profileId,
  headline,
  role,
  size = 'md',
  className,
}: PersonTriggerProps) {
  const [open, setOpen] = useState(false)

  return (
    <span className={cn('relative inline-flex max-w-full', className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="hover:bg-surface-raised flex min-w-0 items-center gap-2 rounded-full py-1 pr-2 pl-1 transition-colors"
      >
        <Avatar name={name} src={avatarUrl} size={size === 'sm' ? 'sm' : 'md'} />
        <span className="min-w-0 text-left">
          <span className="block truncate text-sm font-medium">{name}</span>
          {headline && <span className="text-ink-muted block truncate text-xs">{headline}</span>}
        </span>
      </button>
      {open && (
        <PersonPopover
          name={name}
          profileId={profileId}
          roleOnProject={role}
          onClose={() => setOpen(false)}
        />
      )}
    </span>
  )
}
