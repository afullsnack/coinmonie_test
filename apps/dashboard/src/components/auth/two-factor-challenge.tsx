import { useState } from 'react'

import { KeyIllustration } from '#/components/dashboard/illustrations'
import { CodeDialog } from '#/components/settings/dialogs'
import { Checkbox } from '#/components/ui/checkbox'
import { authClient, authErrorMessage } from '#/lib/auth-client'

/**
 * The sign-in 2FA step: shown after a password or PIN sign-in when the
 * account has 2FA on. A correct code creates the session.
 */
export function TwoFactorChallenge({
  open,
  onCancel,
  onVerified,
}: {
  open: boolean
  onCancel: () => void
  onVerified: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [trustDevice, setTrustDevice] = useState(false)

  return (
    <CodeDialog
      open={open}
      art={<KeyIllustration />}
      title="Enter 2FA code"
      description="Enter the 6-digit code generated for Coinmonie from your authenticator app."
      confirmLabel="Continue"
      error={error}
      loading={loading}
      footer={
        <label className="mt-4 flex items-center justify-center gap-2 text-xs text-[#9a9a9a]">
          <Checkbox
            checked={trustDevice}
            onCheckedChange={(checked) => setTrustDevice(checked === true)}
            className="size-3.5 rounded-[3px] border-[#5a5a5a] data-checked:border-[#e8e8e8] data-checked:bg-[#e8e8e8] data-checked:text-[#1c1c1c]"
          />
          Trust this device for 30 days
        </label>
      }
      onChange={() => setError(null)}
      onClose={() => {
        setError(null)
        onCancel()
      }}
      onComplete={async (code) => {
        setLoading(true)
        const { error: failure } = await authClient.twoFactor.verifyTotp({ code, trustDevice })
        setLoading(false)
        if (failure) {
          setError(authErrorMessage(failure, 'The code entered is wrong. Try again.'))
          return
        }
        onVerified()
      }}
    />
  )
}
