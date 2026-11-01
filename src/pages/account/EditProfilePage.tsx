// Loads the current account profile before mounting the editable public-details form.

import { AccountPageHeader } from '@/components/account/AccountPageHeader'
import { ProfileEditor } from '@/components/account/ProfileEditor'
import { ErrorState, LoadingState } from '@/components/ui/PageState'
import { getMyProfile } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/useAuth'
import { useAsync } from '@/lib/useAsync'

export function EditProfilePage() {
  const { user } = useAuth()
  const { data, loading, error } = useAsync(getMyProfile, user?.id ?? 'none')
  return (
    <>
      <AccountPageHeader
        eyebrow="Make it yours"
        title="Edit Profile"
        description="Tell the community what you are learning and what you like to build."
      />
      {error ? (
        <ErrorState error={error} />
      ) : loading || !data ? (
        <LoadingState label="Loading profile editor" />
      ) : (
        <ProfileEditor profile={data} />
      )}
    </>
  )
}
