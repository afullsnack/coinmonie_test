import { useState } from 'react'
import { Check, Copy, Share2, X } from 'lucide-react'

import { QrMark } from '#/components/money/chrome'
import { Sheet, SheetClose, SheetContent, SheetTitle } from '#/components/ui/sheet'
import { Separator } from '#/components/ui/separator'
import { PrimaryButton } from '#/components/auth/primary-button'

const ADDRESS = '0x7a3f9C2b41E8d0A6f5c1Bd7e2A9b21c'

/** The right-side "Receive USDC" sheet with deposit address + QR. */
export function ReceiveSheet({
  open,
  onClose,
  onFundsAdded,
}: {
  open: boolean
  onClose: () => void
  onFundsAdded: () => void
}) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard?.writeText(ADDRESS).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const share = () => {
    if (typeof navigator.share === 'function') {
      navigator.share({ title: 'USDC deposit address', text: ADDRESS }).catch(() => {})
    } else {
      copy()
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <SheetContent
        className="gap-0 rounded-bl-[20px] border-0 bg-[#1f1f1f] p-5 data-[side=right]:bottom-auto data-[side=right]:h-auto data-[side=right]:w-[560px] data-[side=right]:max-w-[calc(100vw-24px)] data-[side=right]:sm:max-w-[560px]"
        overlayClassName="bg-black/60 backdrop-blur-md"
        showCloseButton={false}
      >
        <div className="flex items-center justify-between">
          <SheetTitle className="text-xl font-semibold text-[#fafafa]">
            Receive USDC
          </SheetTitle>
          <SheetClose
            render={
              <button
                type="button"
                aria-label="Close"
                className="text-[#e6e6e6] outline-none hover:text-white"
              />
            }
          >
            <X className="size-[22px]" />
          </SheetClose>
        </div>
        <Separator className="mt-[16px] bg-[#2b2b2b]" />

        <div className="mt-[20px] flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-[13px] text-[#9a9a9a]">Base network</p>
            <p className="mt-[4px] text-lg font-semibold text-[#fafafa]">USDC</p>
            <p className="mt-[16px] text-[13px] text-[#9a9a9a]">Deposit address</p>
            <p className="mt-[4px] text-[15px] break-all text-[#f5f5f5]">{ADDRESS}</p>
            <div className="mt-[16px] flex flex-wrap gap-[10px]">
              <button
                type="button"
                onClick={copy}
                className="flex h-10 items-center gap-2 rounded-full bg-[#2b2b2b] px-4 text-sm font-medium whitespace-nowrap text-[#f5f5f5] transition-colors outline-none hover:bg-[#333333]"
              >
                {copied ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
                {copied ? 'Copied' : 'Copy address'}
              </button>
              <button
                type="button"
                onClick={share}
                className="flex h-10 items-center gap-2 rounded-full bg-[#f5f5f5] px-4 text-sm font-medium whitespace-nowrap text-[#1a1a1a] transition-colors outline-none hover:bg-white"
              >
                <Share2 aria-hidden="true" className="size-4" />
                Share
              </button>
            </div>
          </div>
          <QrMark
            className="size-[104px]"
            badge={
              <span className="flex size-7 items-center justify-center rounded-full bg-[#2775ca] text-[11px] font-bold text-white ring-2 ring-[#1f1f1f]">
                $
              </span>
            }
          />
        </div>

        <Separator className="mt-[20px] bg-[#2b2b2b]" />
        <div className="mt-[20px]">
          <PrimaryButton
            type="button"
            onClick={onFundsAdded}
            className="w-full"
          >
            Close
          </PrimaryButton>
        </div>
      </SheetContent>
    </Sheet>
  )
}

/** The "+150 USDC has been added" confirmation modal. */
export function FundsAddedModal({
  onClose,
  onView,
}: {
  onClose: () => void
  onView?: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div
        role="dialog"
        aria-label="Funds added"
        className="relative w-[600px] max-w-[calc(100%-48px)] rounded-[24px] bg-[#262626] p-[28px] text-center"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-[22px] right-[22px] text-[#e6e6e6] outline-none hover:text-white"
        >
          <X className="size-[22px]" />
        </button>
        <span className="mx-auto flex size-[72px] items-center justify-center rounded-full bg-[#2775ca] text-2xl font-bold text-white shadow-[0_10px_28px_rgba(39,117,202,0.45)]">
          $
        </span>
        <h2 className="mt-[20px] text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
          +150 USDC
        </h2>
        <p className="mt-[8px] text-sm text-[#9a9a9a]">has been added to your wallet.</p>
        <div className="mt-[24px] flex gap-[10px]">
          <button
            type="button"
            onClick={onView ?? onClose}
            className="h-[48px] flex-1 rounded-[12px] bg-[#2b2b2b] text-sm font-medium text-[#f5f5f5] transition-colors outline-none hover:bg-[#333333]"
          >
            View transaction
          </button>
          <PrimaryButton type="button" onClick={onClose} className="flex-1">
            Done
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}
