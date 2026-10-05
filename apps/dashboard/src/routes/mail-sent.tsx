import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'

import { BackHeader } from '#/components/auth/back-header'
import { EnvelopeBadge } from '#/components/auth/illustrations'

export const Route = createFileRoute('/mail-sent')({
  validateSearch: z.object({
    flow: z.enum(['password', 'pin']).catch('password'),
    email: z.string().optional(),
  }),
  head: () => ({ meta: [{ title: 'We sent you a mail · CoinMonie' }] }),
  component: MailSent,
})

function MailSent() {
  const navigate = useNavigate()
  const { flow, email } = Route.useSearch()

  return (
    <div className="min-h-dvh bg-[#1a1a1a] font-sans antialiased">
      <BackHeader onBack={() => navigate({ to: flow === 'pin' ? '/forgot-pin' : '/forgot-password' })} />
      <main className="mx-auto w-[448px] max-w-[calc(100%-48px)] pt-[110px] pb-16 text-center">
        <EnvelopeBadge className="mx-auto" />
        <h1 className="mt-[22px] text-[26px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
          We sent you a mail
        </h1>
        <p className="mt-[10px] text-sm text-[#9a9a9a]">
          We sent you a {flow === 'pin' ? 'PIN' : 'password'} reset link to your email
          {email ? (
            <>
              <br />
              <span className="font-medium break-all text-[#e6e6e6]">{email}</span>
            </>
          ) : null}
        </p>
      </main>
    </div>
  )
}
