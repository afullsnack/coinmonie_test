import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { CircleCheck } from 'lucide-react'

import { PrimaryButton } from '#/components/auth/primary-button'
import { Separator } from '#/components/ui/separator'
import {
  BENEFICIARIES,
  USDC_NGN_RATE,
  usePayout,
} from '#/components/payouts/payout-context'
import {
  PayoutSuccessModal,
  RateLockedPill,
  UsdcBadge,
} from '#/components/payouts/payout-ui'
import { useStepUp } from '#/components/auth/step-up'

export const Route = createFileRoute('/payouts/review')({
  component: ReviewPayout,
})

const fmt = (n: number) =>
  n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function QuoteRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[15px]">
      <span className="text-[#9a9a9a]">{label}</span>
      <span className="flex items-center gap-2 text-[#f5f5f5]">
        {value}
        <UsdcBadge />
      </span>
    </div>
  )
}

function ReviewPayout() {
  const navigate = useNavigate()
  const payout = usePayout()
  const stepUp = useStepUp()
  const [successModal, setSuccessModal] = useState(false)
  const [busy, setBusy] = useState(false)
  const [rateSeconds, setRateSeconds] = useState(28)

  const recipient = BENEFICIARIES.find((b) => b.id === payout.recipientId)
  const amount = Number(payout.amount)
  const fee = amount > 0 ? amount * 0.01 : 0
  const refunded = amount - fee
  const recipientGets = Math.round(amount * USDC_NGN_RATE)

  useEffect(() => {
    if (rateSeconds <= 0) return
    const timer = window.setInterval(() => setRateSeconds((s) => s - 1), 1000)
    return () => window.clearInterval(timer)
  }, [rateSeconds])

  const confirm = async () => {
    if (!recipient || !(amount > 0)) return
    if (!(await stepUp.require(['twoFactor', 'pin']))) return
    setBusy(true)
    // UI-only wiring: brief pending state, then the success modal.
    setTimeout(() => {
      setBusy(false)
      setSuccessModal(true)
    }, 1200)
  }

  return (
    <main className="mx-auto w-[620px] max-w-[calc(100%-48px)] pt-[58px] pb-16">
      <h1 className="text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
        Review payout
      </h1>

      <div className="mt-[24px] rounded-[16px] bg-[#212121]">
        <div className="flex items-center gap-3 px-5 py-4">
          {recipient ? (
            <>
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white"
                style={{ backgroundColor: recipient.color }}
              >
                {initials(recipient.name)}
              </span>
              <div className="leading-tight">
                <p className="text-[15px] font-medium text-[#f5f5f5]">
                  {recipient.name}
                </p>
                <p className="text-sm text-[#9a9a9a]">
                  {recipient.bank} · {recipient.account} · {recipient.country}
                </p>
              </div>
              <CircleCheck
                className="ml-auto size-5 text-[#30c463]"
                fill="currentColor"
                stroke="#212121"
                strokeWidth={2.5}
              />
            </>
          ) : (
            <p className="text-sm text-[#9a9a9a]">No recipient selected</p>
          )}
        </div>
        <Separator className="bg-[#2f2f2f]" />

        <div className="flex flex-col gap-[18px] px-5 py-5">
          <QuoteRow
            label="You send"
            value={`${amount > 0 ? fmt(amount) : '0.00'} USDC`}
          />
          <QuoteRow label="Coinmonie fee · 1%" value={`${fmt(fee)} USDC`} />
          <QuoteRow label="Amount refunded" value={`${fmt(refunded)} USDC`} />
          <div className="flex items-center justify-between text-[15px]">
            <span className="text-[#9a9a9a]">Rate</span>
            <span className="text-[#f5f5f5]">1 USDC = 1,631 NGN</span>
          </div>
          <RateLockedPill seconds={rateSeconds} />
        </div>
        <Separator className="bg-[#2f2f2f]" />
        <div className="px-5 py-5">
          <div className="flex items-center justify-between">
            <span className="text-[15px] text-[#9a9a9a]">Recipient gets</span>
            <span className="text-[26px] leading-none font-semibold text-[#fafafa]">
              ₦{recipientGets.toLocaleString('en-US')}
            </span>
          </div>
          <PrimaryButton
            type="button"
            disabled={!recipient || !(amount > 0)}
            loading={busy}
            onClick={confirm}
            className="mt-[20px]"
          >
            Confirm & send
          </PrimaryButton>
          <p className="mt-[10px] text-center text-[13px] text-[#9a9a9a]">
            Estimated settlement · under 30 seconds
          </p>
        </div>
      </div>

      {successModal && recipient ? (
        <PayoutSuccessModal
          title="Payout on its way"
          message={
            <>
              {fmt(amount)} USDC is being settled into {recipient.name}'s
              account.
              <br />
              You'll get a notification when sent.
            </>
          }
          rows={[
            {
              label: 'Recipient gets',
              value: `₦${recipientGets.toLocaleString('en-US')}`,
            },
            {
              label: 'Reference',
              value: `pyt__1a2b${payout.reference ? ` · ${payout.reference}` : ''}`,
            },
            { label: 'Estimated', value: 'Under 30 seconds' },
          ]}
          secondaryLabel="View transaction"
          primaryLabel="Go to dashboard"
          onSecondary={() => setSuccessModal(false)}
          onPrimary={() => navigate({ to: '/dashboard' })}
          onClose={() => setSuccessModal(false)}
        />
      ) : null}
    </main>
  )
}
