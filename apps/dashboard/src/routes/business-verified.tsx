import { requireSession } from '#/lib/session'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { X } from 'lucide-react'

import { FlowerCheck } from '#/components/auth/illustrations'
import { PrimaryButton } from '#/components/auth/primary-button'
import { Separator } from '#/components/ui/separator'

export const Route = createFileRoute('/business-verified')({
  beforeLoad: requireSession,
  head: () => ({ meta: [{ title: 'Business verified · CoinMonie' }] }),
  component: BusinessVerified,
})

function BusinessVerified() {
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh bg-[#1a1a1a] font-sans antialiased">
      <header>
        <div className="flex h-[83px] items-center px-10">
          <button
            type="button"
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-[8px] rounded-full bg-[#2e2e2e] py-[10px] pr-[20px] pl-[16px] text-[13px] font-medium text-[#e6e6e6] transition-colors outline-none hover:bg-[#383838]"
          >
            <X aria-hidden="true" className="size-4" />
            Close
          </button>
        </div>
        <Separator className="bg-[#2b2b2b]" />
      </header>
      <main className="mx-auto w-[448px] max-w-[calc(100%-48px)] pt-[36px] pb-16 text-center">
        <FlowerCheck className="mx-auto" />
        <h1 className="mt-[24px] text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
          Business verified
        </h1>
        <p className="mt-[10px] text-sm text-[#9a9a9a]">
          Congratulations your business has been verified successfully.
        </p>
        <Separator className="mt-[32px] bg-[#2f2f2f]" />
        <PrimaryButton
          type="button"
          onClick={() => navigate({ to: '/' })}
          className="mt-[13px]"
        >
          Go to dashboard
        </PrimaryButton>
      </main>
    </div>
  )
}
