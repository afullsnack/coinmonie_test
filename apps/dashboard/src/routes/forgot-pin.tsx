import { createFileRoute } from '@tanstack/react-router'

import { ForgotEmailScreen } from '#/components/auth/forgot-email-screen'
import { getLastAccount } from '#/lib/last-account'

export const Route = createFileRoute('/forgot-pin')({
  loader: () => getLastAccount(),
  head: () => ({ meta: [{ title: 'Reset PIN · CoinMonie' }] }),
  component: ForgotPin,
})

function ForgotPin() {
  const lastAccount = Route.useLoaderData()
  return <ForgotEmailScreen kind="pin" defaultEmail={lastAccount?.email} />
}
