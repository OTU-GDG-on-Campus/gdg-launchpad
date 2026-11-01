// Profile settings reuse every onboarding field, private drafts, media controls, and atomic saves.

import { ProfileWizard } from '@/components/onboarding/ProfileWizard'
import type { AccountProfile } from '@/types'

export function ProfileEditor({ profile }: { profile: AccountProfile }) {
  return <ProfileWizard key={profile.id} profile={profile} />
}
