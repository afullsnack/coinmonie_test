import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'

import { AuthShell } from '#/components/auth/auth-shell'
import { FlowerCheck } from '#/components/auth/illustrations'
import { PrimaryButton } from '#/components/auth/primary-button'
import { Separator } from '#/components/ui/separator'

export const Route = createFileRoute('/account-created')({
  validateSearch: z.object({ email: z.email().optional() }),
  beforeLoad: ({ search }) => {
    if (!search.email) throw redirect({ to: '/signup' })
  },
  head: () => ({ meta: [{ title: 'Account created · CoinMonie' }] }),
  component: AccountCreated,
})

function AccountCreated() {
  const navigate = useNavigate()
  const { email } = Route.useSearch()

  return (
    <AuthShell className="text-center">
      <FlowerCheck className="mx-auto" />
      <h1 className="mt-[31px] text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
        Account created
      </h1>
      <p className="mt-[10px] text-sm text-[#9a9a9a]">
        Your account has been created successfully,
        <br />
        continue to finish your account setup
      </p>
      <Separator className="mt-[32px] bg-[#2f2f2f]" />
      <PrimaryButton
        type="button"
        autoFocus
        onClick={() => navigate({ to: '/verify-email', search: { email } })}
        className="mt-[13px]"
      >
        Continue
      </PrimaryButton>
    </AuthShell>
  )
}
