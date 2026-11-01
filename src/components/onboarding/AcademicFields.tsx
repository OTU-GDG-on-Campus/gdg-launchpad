// Personal and academic inputs reused by onboarding and profile settings.

import { useState } from 'react'
import { PROGRAMS, STUDY_YEARS } from '@/lib/profile'
import type { OnboardingDetails } from '@/types'
import { ProfileField } from './ProfileField'

interface AcademicFieldsProps {
  details: OnboardingDetails
  onChange: (patch: Partial<OnboardingDetails>) => void
  errors: Record<string, string>
}

export function AcademicFields({ details, onChange, errors }: AcademicFieldsProps) {
  const [other, setOther] = useState(
    Boolean(details.program && !PROGRAMS.includes(details.program)),
  )
  return (
    <div className="space-y-5">
      <p className="text-ink-soft text-sm leading-relaxed">
        Tell us a little about yourself. Your first and last name stay private when you choose a
        display name.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <ProfileField
          label="First name"
          value={details.firstName}
          onChange={(firstName) => onChange({ firstName })}
          required
          maxLength={40}
          autoComplete="given-name"
          error={errors.firstName}
        />
        <ProfileField
          label="Last name"
          value={details.lastName}
          onChange={(lastName) => onChange({ lastName })}
          required
          maxLength={40}
          autoComplete="family-name"
          error={errors.lastName}
        />
      </div>
      <ProfileField
        label="Preferred display name"
        value={details.displayName}
        onChange={(displayName) => onChange({ displayName })}
        maxLength={80}
        autoComplete="nickname"
        hint="Leave blank to display your first and last name."
        error={errors.displayName}
      />
      <ProfileField
        label="Academic program"
        value={other ? 'Other Ontario Tech program' : details.program}
        required
        options={[...PROGRAMS, 'Other Ontario Tech program']}
        onChange={(program) => {
          setOther(program === 'Other Ontario Tech program')
          onChange({ program: program === 'Other Ontario Tech program' ? '' : program })
        }}
        error={!other ? errors.program : undefined}
      />
      {other && (
        <ProfileField
          label="Your program"
          value={details.program}
          onChange={(program) => onChange({ program })}
          required
          maxLength={80}
          placeholder="e.g. Health Sciences"
          error={errors.program}
        />
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <ProfileField
          label="Current year of study"
          value={details.studyYear}
          onChange={(studyYear) => onChange({ studyYear })}
          required
          options={STUDY_YEARS}
          error={errors.studyYear}
        />
        <ProfileField
          label="Expected graduation year"
          value={details.graduationYear}
          onChange={(graduationYear) => onChange({ graduationYear })}
          maxLength={4}
          placeholder="2029"
          error={errors.graduationYear}
        />
      </div>
      <ProfileField
        label="Personal introduction"
        value={details.introduction}
        onChange={(introduction) => onChange({ introduction })}
        multiline
        maxLength={280}
        placeholder="What brought you here?"
        error={errors.introduction}
        hint={`${details.introduction.length}/280 characters`}
      />
    </div>
  )
}
