import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { X } from 'lucide-react'

import { PinSetupForm } from '#/components/auth/pin-setup'
import { authClient, authErrorMessage } from '#/lib/auth-client'
import { updateRememberedAccount } from '#/lib/last-account'
import { requireSession } from '#/lib/session'

export const Route = createFileRoute('/create-pin')({
  beforeLoad: requireSession,
  head: () => ({ meta: [{ title: 'Create PIN · CoinMonie' }] }),
  component: CreatePin,
})

/** Post-verification step: the PIN confirms payouts and can be used to sign in. */
function CreatePin() {
  const navigate = useNavigate()
  const finish = () => navigate({ to: '/dashboard' })

  return (
    <div className="min-h-dvh bg-[#1a1a1a] font-sans antialiased">
      <div className="mx-auto flex w-[448px] max-w-[calc(100%-48px)] justify-end pt-[56px]">
        <button
          type="button"
          aria-label="Skip for now"
          onClick={finish}
          className="-mr-2 rounded-full p-2 text-[#e6e6e6] outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-[#5a5a5a]"
        >
          <X className="size-[22px]" />
        </button>
      </div>
      <main className="mx-auto w-[400px] max-w-[calc(100%-48px)] pb-16">
        <PinSetupForm
          variant="create"
          showBack
          onSubmit={async (pin) => {
            const { error } = await authClient.pin.set({ pin, enableLogin: true })
            if (error) return authErrorMessage(error)
            updateRememberedAccount({ pin: true })
            finish()
            return null
          }}
        />
      </main>
    </div>
  )
}
