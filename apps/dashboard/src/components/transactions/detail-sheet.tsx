import { useState } from 'react'
import { Check, Copy, Download, FileText, X } from 'lucide-react'

import { PrimaryButton } from '#/components/auth/primary-button'
import { StatusBadge } from '#/components/money/chrome'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Separator } from '#/components/ui/separator'
import { Sheet, SheetClose, SheetContent, SheetTitle } from '#/components/ui/sheet'
import type { Tx } from '#/components/transactions/data'

export function TransactionDetail({
  tx,
  onClose,
  onRecipients,
}: {
  tx: Tx | null
  onClose: () => void
  onRecipients: () => void
}) {
  return (
    <Sheet open={tx !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        overlayClassName="bg-black/55 backdrop-blur-sm"
        className="gap-0 overflow-y-auto border-[#2a2a2a] bg-[#1c1c1c] p-5 data-[side=right]:w-[460px] data-[side=right]:max-w-[calc(100vw-24px)] data-[side=right]:sm:max-w-[460px]"
      >
        {tx ? (
          <>
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-semibold text-white">Transaction details</SheetTitle>
              <SheetClose render={<button type="button" aria-label="Close" className="text-[#e8e8e8] outline-none" />}>
                <X className="size-5" />
              </SheetClose>
            </div>
            <Separator className="my-4 bg-[#2e2e2e]" />
            <div className={tx.detail.centered ? 'text-center' : 'flex items-start justify-between gap-3'}>
              <div>
                <p className="text-[13px] text-[#9a9a9a]">{tx.detail.centered ? 'Amount' : tx.id.startsWith('bulk') ? 'Total amount' : 'Amount'}</p>
                <p className="mt-1 text-[28px] leading-none font-semibold tracking-[-0.03em] text-white">
                  {tx.detail.headline}
                </p>
              </div>
              <StatusBadge tone={tx.tone}>{tx.status}</StatusBadge>
            </div>
            {tx.detail.banner ? (
              <Alert
                className={
                  tx.detail.banner.tone === 'warn'
                    ? 'mt-4 border-0 bg-[#3a3014] text-[#f3d48a]'
                    : tx.detail.banner.tone === 'info'
                      ? 'mt-4 border-0 bg-[#16263d] text-[#9ec0ff]'
                      : 'mt-4 border-0 bg-[#3a1719] text-[#ffb4b4]'
                }
              >
                <AlertDescription className="text-current">{tx.detail.banner.text}</AlertDescription>
              </Alert>
            ) : null}
            <div className="mt-4 flex flex-col">
              {tx.detail.rows.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 border-b border-[#262626] py-3 text-sm">
                  <span className="text-[#9a9a9a]">{item.label}</span>
                  <span className="flex items-center gap-2 text-right text-[#f3f3f3]">
                    {item.tone ? <StatusBadge tone={item.tone}>{item.value}</StatusBadge> : item.value}
                    {item.copy ? <CopyButton value={item.value} /> : null}
                  </span>
                </div>
              ))}
            </div>
            <Footer tx={tx} onClose={onClose} onRecipients={onRecipients} />
          </>
        ) : (
          <SheetTitle className="sr-only">Transaction details</SheetTitle>
        )}
      </SheetContent>
    </Sheet>
  )
}

function Footer({
  tx,
  onClose,
  onRecipients,
}: {
  tx: Tx
  onClose: () => void
  onRecipients: () => void
}) {
  const kind = tx.detail.footer
  if (kind === 'support') {
    return (
      <div className="mt-5 flex gap-3">
        <Ghost>Contact support</Ghost>
        <PrimaryButton type="button" className="flex-1">Try again</PrimaryButton>
      </div>
    )
  }
  if (kind === 'approve') {
    return (
      <div className="mt-5 flex gap-3">
        <Ghost>Reject payout</Ghost>
        <PrimaryButton type="button" className="flex-1">Approve payout</PrimaryButton>
      </div>
    )
  }
  if (kind === 'refresh') {
    return (
      <PrimaryButton type="button" className="mt-5">Refresh status</PrimaryButton>
    )
  }
  if (kind === 'chain') {
    return (
      <PrimaryButton type="button" className="mt-5">View on blockchain</PrimaryButton>
    )
  }
  if (kind === 'receipt') {
    return (
      <PrimaryButton type="button" className="mt-5">Download receipt</PrimaryButton>
    )
  }
  if (kind === 'bulk-success') {
    return (
      <div className="mt-5 flex gap-3">
        <Ghost onClick={onRecipients}>View payout recipients</Ghost>
        <PrimaryButton type="button" className="flex-1">Download report</PrimaryButton>
      </div>
    )
  }
  if (kind === 'bulk-processing') {
    return (
      <div className="mt-5 flex flex-col gap-3">
        <div className="flex gap-2">
          <Ghost>
            <FileText className="size-4" /> Payout status
          </Ghost>
          <Ghost>
            <Download className="size-4" /> Download report
          </Ghost>
        </div>
        <div className="flex gap-3">
          <Ghost onClick={onRecipients}>View payout recipients</Ghost>
          <PrimaryButton type="button" className="flex-1">Refresh status</PrimaryButton>
        </div>
      </div>
    )
  }
  if (kind === 'bulk-failed') {
    return (
      <div className="mt-4 flex flex-col gap-3">
        <button type="button" className="mx-auto flex items-center gap-2 text-sm text-[#d0d0d0] outline-none">
          <Download className="size-4" />
          Download report
        </button>
        <div className="flex gap-3">
          <Ghost>Contact support</Ghost>
          <PrimaryButton type="button" className="flex-1">Try again</PrimaryButton>
        </div>
      </div>
    )
  }
  return (
    <PrimaryButton type="button" className="mt-5" onClick={onClose}>
      Close
    </PrimaryButton>
  )
}

function Ghost({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[12px] bg-[#2e2e2e] text-sm font-medium text-white outline-none hover:bg-[#3a3a3a]"
    >
      {children}
    </button>
  )
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      aria-label="Copy"
      onClick={() => {
        navigator.clipboard?.writeText(value).catch(() => {})
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1200)
      }}
      className="text-[#bdbdbd] outline-none hover:text-white"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  )
}
