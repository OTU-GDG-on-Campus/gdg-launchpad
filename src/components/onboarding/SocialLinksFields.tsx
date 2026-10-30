// Optional platform links with per-link visibility, safe validation, and repeatable custom websites.

import { useState } from 'react'
import { PlatformIcon } from '@/components/account/PlatformIcon'
import { Button } from '@/components/ui/Button'
import { LINK_PLATFORMS } from '@/config/onboarding'
import type { ProfileLink } from '@/types'
import { ProfileField } from './ProfileField'

interface SocialLinksFieldsProps {
  links: ProfileLink[]
  onChange: (links: ProfileLink[]) => void
  errors: Record<string, string>
}

export function SocialLinksFields({ links, onChange, errors }: SocialLinksFieldsProps) {
  const [platform, setPlatform] = useState('github')
  function update(id: string, patch: Partial<ProfileLink>) {
    onChange(links.map((link) => (link.id === id ? { ...link, ...patch } : link)))
  }
  return (
    <div className="space-y-5">
      <p className="text-ink-soft text-sm leading-relaxed">
        Share where you build, write, and connect. Every link is optional. Private links are visible
        only to you in your settings.
      </p>
      {links.map((link, index) => (
        <fieldset
          key={link.id}
          className="border-line bg-surface-muted space-y-4 rounded-xl border p-4"
        >
          <legend className="px-2 text-sm font-semibold">
            <span className="inline-flex items-center gap-2">
              <PlatformIcon platform={link.platform} />
              {LINK_PLATFORMS.find((item) => item.id === link.platform)?.label} {index + 1}
            </span>
          </legend>
          {link.platform === 'custom' && (
            <ProfileField
              label="Website label"
              value={link.label}
              onChange={(label) => update(link.id, { label })}
              required
              maxLength={60}
            />
          )}
          <ProfileField
            label={link.platform === 'discord' ? 'Discord username' : 'Profile URL'}
            value={link.value}
            onChange={(value) => update(link.id, { value })}
            required
            maxLength={2048}
            placeholder={link.platform === 'discord' ? 'your.username' : 'https://'}
            error={errors[`link-${link.id}`]}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-brand-500 size-4"
                checked={link.isPublic}
                onChange={(event) => update(link.id, { isPublic: event.target.checked })}
              />
              Show on my public profile
            </label>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onChange(links.filter((item) => item.id !== link.id))}
              aria-label={`Remove ${link.label} link ${index + 1}`}
            >
              Remove
            </Button>
          </div>
        </fieldset>
      ))}
      {links.length < 20 && (
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-40 flex-1">
            <label htmlFor="add-link-platform" className="text-sm font-semibold">
              Add a platform
            </label>
            <select
              id="add-link-platform"
              value={platform}
              onChange={(event) => setPlatform(event.target.value)}
              className="border-line bg-surface-muted mt-2 min-h-12 w-full rounded-xl border px-3 text-sm"
            >
              {LINK_PLATFORMS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() =>
              onChange([
                ...links,
                {
                  id: crypto.randomUUID(),
                  platform,
                  label: LINK_PLATFORMS.find((item) => item.id === platform)?.label ?? 'Website',
                  value: '',
                  isPublic: true,
                },
              ])
            }
          >
            + Add link
          </Button>
        </div>
      )}
      {errors.links && (
        <p role="alert" className="text-danger text-sm">
          {errors.links}
        </p>
      )}
    </div>
  )
}
