import { ArrowRight, Lock, X } from 'lucide-react'
import { cn } from 'cn'

import { FlowerCheck } from '#/components/auth/illustrations'
import { PrimaryButton } from '#/components/auth/primary-button'

/** Shared card + modal styling for the payout screens. */
export const CARD = 'rounded-[16px] bg-[#212121]'
export const QUOTE_ROW = 'flex items-center justify-between text-[15px]'
export const SELECT_TRIGGER =
  'h-[44px] w-full justify-between rounded-[10px] border-transparent bg-[#212121] px-[14px] text-[15px] text-[#e6e6e6] data-[placeholder]:text-[#6b6b6b] hover:bg-[#212121] focus-visible:ring-0 open:bg-[#2a2a2a]'
export const SELECT_CONTENT =
  'rounded-[12px] border border-[#2f2f2f] bg-[#262626] p-[6px] text-[#e6e6e6] ring-0'
export const SELECT_ITEM =
  'rounded-[8px] px-[10px] py-[8px] text-[15px] data-highlighted:bg-[#333333]'

export function UsdcBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'flex size-[18px] shrink-0 items-center justify-center rounded-full bg-[#2775ca] text-[10px] font-bold text-white',
        className,
      )}
    >
      $
    </span>
  )
}

export function SectionLabel({
  children,
  info,
}: {
  children: React.ReactNode
  info?: boolean
}) {
  return (
    <p className="mb-[8px] flex items-center gap-2 text-sm text-[#9a9a9a]">
      {children}
      {info ? <InfoDot /> : null}
    </p>
  )
}

export function InfoDot() {
  return (
    <span
      aria-hidden="true"
      className="flex size-4 items-center justify-center rounded-full border border-[#4a4a4a] text-[9px] text-[#8a8a8a]"
    >
      i
    </span>
  )
}

export function RateLockedPill({ seconds }: { seconds: number }) {
  return (
    <div className="flex h-11 items-center gap-2 rounded-[10px] bg-[#2f2f2f] px-3 text-sm text-[#c9c9c9]">
      <Lock aria-hidden="true" className="size-4" />
      Rate locked · held for {Math.floor(seconds / 60)}:
      {String(seconds % 60).padStart(2, '0')}
    </div>
  )
}

export function PayoutTypeModal({
  onPick,
  onClose,
}: {
  onPick: (type: 'single' | 'bulk') => void
  onClose: () => void
}) {
  const options = [
    {
      type: 'single' as const,
      title: 'Single payout',
      sub: 'Send money to one recipient',
    },
    {
      type: 'bulk' as const,
      title: 'Bulk payout',
      sub: 'Send money to multiple recipients',
    },
  ]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div
        role="dialog"
        aria-label="New payout"
        className="w-[600px] max-w-[calc(100%-48px)] rounded-[24px] bg-[#262626] p-[28px]"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
            New payout
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-[#e6e6e6] outline-none hover:text-white"
          >
            <X className="size-[22px]" />
          </button>
        </div>
        <div className="mt-[24px] flex flex-col gap-[10px]">
          {options.map((option) => (
            <button
              key={option.type}
              type="button"
              onClick={() => onPick(option.type)}
              className="flex h-[76px] items-center rounded-[12px] bg-[#2f2f2f] px-5 text-left outline-none transition-colors hover:bg-[#383838]"
            >
              <span className="flex-1">
                <span className="block text-[17px] font-medium text-[#f5f5f5]">
                  {option.title}
                </span>
                <span className="mt-[2px] block text-sm text-[#9a9a9a]">
                  {option.sub}
                </span>
              </span>
              <span className="flex size-8 items-center justify-center rounded-full bg-[#3a3a3a] text-[#e6e6e6]">
                <ArrowRight className="size-4 rotate-90" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PayoutSuccessModal({
  title,
  message,
  rows,
  secondaryLabel,
  primaryLabel,
  onSecondary,
  onPrimary,
  onClose,
}: {
  title: string
  message: React.ReactNode
  rows: { label: string; value: React.ReactNode }[]
  secondaryLabel: string
  primaryLabel: string
  onSecondary: () => void
  onPrimary: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div
        role="dialog"
        aria-label={title}
        className="w-[600px] max-w-[calc(100%-48px)] rounded-[24px] bg-[#262626] p-[28px] text-center"
      >
        <div className="flex justify-end">
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-[#e6e6e6] outline-none hover:text-white"
          >
            <X className="size-[22px]" />
          </button>
        </div>
        <FlowerCheck className="mx-auto" />
        <h2 className="mt-[20px] text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
          {title}
        </h2>
        <p className="mt-[10px] text-sm text-[#9a9a9a]">{message}</p>
        <div className="mt-[24px] flex flex-col gap-[14px] rounded-[16px] border border-[#2f2f2f] px-5 py-4 text-left">
          {rows.map((row) => (
            <div key={row.label} className={QUOTE_ROW}>
              <span className="text-[#9a9a9a]">{row.label}</span>
              <span className="text-[#e6e6e6]">{row.value}</span>
            </div>
          ))}
        </div>
        <div className="mt-[24px] flex gap-[10px]">
          <button
            type="button"
            onClick={onSecondary}
            className="h-[48px] flex-1 rounded-[12px] bg-[#2b2b2b] text-sm font-medium text-[#f5f5f5] transition-colors outline-none hover:bg-[#333333]"
          >
            {secondaryLabel}
          </button>
          <PrimaryButton type="button" onClick={onPrimary} className="flex-1">
            {primaryLabel}
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}
