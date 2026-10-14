import { requireSession } from '#/lib/session'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { X } from 'lucide-react'

import { ErrorCircleIllustration } from '#/components/kyb/illustrations'
import { Separator } from '#/components/ui/separator'

export const Route = createFileRoute('/business-verification-failed')({
  beforeLoad: requireSession,
  head: () => ({
    meta: [{ title: 'We couldn\u2019t verify your business · CoinMonie' }],
  }),
  component: BusinessVerificationFailed,
})

function BusinessVerificationFailed() {
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
      <main className="mx-auto w-[448px] max-w-[calc(100%-48px)] pt-[40px] pb-16 text-center">
        <ErrorCircleIllustration className="mx-auto" />
        <h1 className="mt-[26px] text-[24px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
          We couldn't verify your business
        </h1>
        <p className="mt-[10px] text-sm text-[#9a9a9a]">
          We couldn't verify some of the documents you shared, kindly try again.
        </p>
        <div className="mt-[36px] flex justify-center gap-[10px]">
          <button
            type="button"
            onClick={() => navigate({ to: '/' })}
            className="h-[48px] rounded-[12px] bg-[#2b2b2b] px-[28px] text-sm font-medium text-[#f5f5f5] transition-colors outline-none hover:bg-[#333333]"
          >
            Contact support
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: '/kyb/upload-documents' })}
            className="h-[48px] rounded-[12px] bg-[#f5f5f5] px-[28px] text-sm font-medium text-[#1a1a1a] transition-colors outline-none hover:bg-white"
          >
            Try again
          </button>
        </div>
      </main>
    </div>
  )
}
