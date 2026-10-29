// Shared step content for the registration wizard and the private profile editor.

import { useState } from 'react'
import type { OnboardingDetails } from '@/types'
import { AcademicFields } from './AcademicFields'
import { DeveloperFields } from './DeveloperFields'
import { ProfileImageUpload } from './ProfileImageUpload'
import { SocialLinksFields } from './SocialLinksFields'

interface ProfileFieldsProps {
  step: number
  details: OnboardingDetails
  onChange: (patch: Partial<OnboardingDetails>) => void
  errors: Record<string, string>
  onBusy: (busy: boolean) => void
}

export function ProfileFields({ step, details, onChange, errors, onBusy }: ProfileFieldsProps) {
  const [busy, setBusy] = useState({ avatar: false, banner: false })
  if (step === 3) return <AcademicFields details={details} onChange={onChange} errors={errors} />
  if (step === 4) return <DeveloperFields details={details} onChange={onChange} errors={errors} />
  if (step === 6)
    return (
      <SocialLinksFields
        links={details.links}
        onChange={(links) => onChange({ links })}
        errors={errors}
      />
    )
  return (
    <div className="space-y-5">
      <p className="text-ink-soft text-sm">
        Make your profile feel like you. Crop and upload each image before continuing. Both are
        optional.
      </p>
      {(['avatar', 'banner'] as const).map((kind) => (
        <ProfileImageUpload
          key={kind}
          kind={kind}
          name={details.displayName || details.firstName}
          url={details[`${kind}Url`]}
          onChange={(path, url) => onChange({ [`${kind}Path`]: path, [`${kind}Url`]: url })}
          onBusy={(value) => {
            const next = { ...busy, [kind]: value }
            setBusy(next)
            onBusy(next.avatar || next.banner)
          }}
        />
      ))}
    </div>
  )
}
