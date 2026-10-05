import { requireSession } from '#/lib/session'
import { Outlet, createFileRoute } from '@tanstack/react-router'

import { BackHeader } from '#/components/auth/back-header'
import { PayoutProvider } from '#/components/payouts/payout-context'

export const Route = createFileRoute('/payouts')({
  beforeLoad: requireSession,
  head: () => ({ meta: [{ title: 'New payout · CoinMonie' }] }),
  component: PayoutsLayout,
})

function PayoutsLayout() {
  return (
    <div className="min-h-dvh bg-[#161616] font-sans antialiased">
      <BackHeader />
      <PayoutProvider>
        <Outlet />
      </PayoutProvider>
    </div>
  )
}
