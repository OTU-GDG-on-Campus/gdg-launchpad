// Optional developer identity, searchable skills, and collaboration preferences.

import { COLLABORATION_OPTIONS, SKILL_OPTIONS } from '@/config/onboarding'
import type { OnboardingDetails } from '@/types'
import { ProfileField } from './ProfileField'
import { SkillSelect } from './SkillSelect'

interface DeveloperFieldsProps {
  details: OnboardingDetails
  onChange: (patch: Partial<OnboardingDetails>) => void
  errors: Record<string, string>
}

export function DeveloperFields({ details, onChange, errors }: DeveloperFieldsProps) {
  return (
    <div className="space-y-5">
      <p className="text-ink-soft text-sm">
        Learning your first language or shipping your tenth app? There is a place for you.
        Everything here is optional.
      </p>
      <ProfileField
        label="Professional headline"
        value={details.headline}
        onChange={(headline) => onChange({ headline })}
        maxLength={60}
        placeholder="CS student building useful things with React"
        error={errors.headline}
      />
      <ProfileField
        label="Developer biography"
        value={details.bio}
        onChange={(bio) => onChange({ bio })}
        maxLength={500}
        multiline
        error={errors.bio}
        hint={`${details.bio.length}/500 characters`}
      />
      {(Object.keys(SKILL_OPTIONS) as (keyof typeof SKILL_OPTIONS)[]).map((key) => (
        <SkillSelect
          key={key}
          label={
            {
              languages: 'Programming languages',
              frameworks: 'Frameworks & libraries',
              tools: 'Developer tools',
              interests: 'Technical interests',
              roles: 'Preferred roles',
            }[key]
          }
          options={SKILL_OPTIONS[key]}
          value={details[key]}
          onChange={(items) => onChange({ [key]: items })}
          error={errors[key]}
        />
      ))}
      <SkillSelect
        label="Other skills"
        options={[]}
        value={details.skills}
        onChange={(skills) => onChange({ skills })}
        error={errors.skills}
      />
      <fieldset className="space-y-3">
        <legend className="mb-3 text-sm font-semibold">How would you like to connect?</legend>
        {COLLABORATION_OPTIONS.map((option) => (
          <label
            key={option}
            className="border-line bg-surface-muted flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm"
          >
            <input
              type="checkbox"
              className="accent-brand-500 size-4"
              checked={details.collaboration.includes(option)}
              onChange={(event) =>
                onChange({
                  collaboration: event.target.checked
                    ? [...details.collaboration, option]
                    : details.collaboration.filter((item) => item !== option),
                })
              }
            />
            {option}
          </label>
        ))}
      </fieldset>
    </div>
  )
}
