import { createFileRoute } from '@tanstack/react-router'

import { ForgotEmailScreen } from '#/components/auth/forgot-email-screen'
import { getLastAccount } from '#/lib/last-account'

export const Route = createFileRoute('/forgot-password')({
  loader: () => getLastAccount(),
  head: () => ({ meta: [{ title: 'Reset password · CoinMonie' }] }),
  component: ForgotPassword,
})

function ForgotPassword() {
  const lastAccount = Route.useLoaderData()
  return <ForgotEmailScreen kind="password" defaultEmail={lastAccount?.email} />
}
