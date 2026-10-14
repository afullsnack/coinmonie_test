import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'

import { BackHeader } from '#/components/auth/back-header'
import { UnlockIllustration } from '#/components/auth/illustrations'
import { PinSetupForm } from '#/components/auth/pin-setup'
import { PrimaryButton } from '#/components/auth/primary-button'
import { SuccessModal } from '#/components/auth/success-modal'
import { Separator } from '#/components/ui/separator'
import { authClient, authErrorMessage } from '#/lib/auth-client'

export const Route = createFileRoute('/reset-pin')({
  validateSearch: z.object({ token: z.string().optional() }),
  head: () => ({ meta: [{ title: 'Create new PIN · CoinMonie' }] }),
  component: ResetPin,
})

function ResetPin() {
  const navigate = useNavigate()
  const { token } = Route.useSearch()
  const [done, setDone] = useState(false)
  const [expired, setExpired] = useState(!token)

  return (
    <div className="min-h-dvh bg-[#1a1a1a] font-sans antialiased">
      <BackHeader />
      <main className="mx-auto w-[400px] max-w-[calc(100%-48px)] pt-[34px] pb-16">
        {expired || !token ? (
          <div className="text-center">
            <UnlockIllustration className="mx-auto" />
            <h1 className="mt-[24px] text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
              This link has expired
            </h1>
            <p className="mt-[10px] text-sm text-[#9a9a9a]">Request a new link to reset your PIN.</p>
            <Separator className="mt-[32px] bg-[#2f2f2f]" />
            <PrimaryButton type="button" className="mt-[14px]" onClick={() => navigate({ to: '/forgot-pin' })}>
              Request new link
            </PrimaryButton>
          </div>
        ) : (
          <PinSetupForm
            variant="reset"
            onSubmit={async (pin) => {
              const { error } = await authClient.pin.reset({ token, pin })
              if (error) {
                if (error.code === 'INVALID_TOKEN') setExpired(true)
                return authErrorMessage(error)
              }
              setDone(true)
              return null
            }}
          />
        )}
      </main>

      {done ? (
        <SuccessModal
          title="PIN created"
          message="Your new PIN has been created successfully"
          actionLabel="Go to dashboard"
          onAction={() => navigate({ to: '/dashboard' })}
          onClose={() => navigate({ to: '/signin' })}
        />
      ) : null}
    </div>
  )
}
