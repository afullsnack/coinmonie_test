import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  CircleCheck,
  Download,
  Eye,
  Plus,
  RotateCw,
  Upload,
  UserRound,
  X,
} from 'lucide-react'

import { PrimaryButton } from '#/components/auth/primary-button'
import { WhitePeopleIllustration } from '#/components/dashboard/illustrations'
import { Separator } from '#/components/ui/separator'
import { Switch } from '#/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  PayoutTypeModal,
  RateLockedPill,
  SectionLabel,
  SELECT_CONTENT,
  SELECT_ITEM,
  SELECT_TRIGGER,
  UsdcBadge,
} from '#/components/payouts/payout-ui'
import {
  BENEFICIARIES,
  USDC_NGN_RATE,
  WALLETS,
  usePayout,
} from '#/components/payouts/payout-context'
import { FlowerCheck } from '#/components/auth/illustrations'
import { useStepUp } from '#/components/auth/step-up'

export const Route = createFileRoute('/payouts/new')({
  component: NewPayout,
})

const FORM_BG = 'h-[44px] rounded-[10px] bg-[#212121] transition-colors'

function XlsIcon() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-[#1d5c38] text-[9px] font-bold text-[#5ff09a]">
      XLS
    </span>
  )
}

function NewPayout() {
  const navigate = useNavigate()
  const payout = usePayout()
  const [typeModal, setTypeModal] = useState(payout.type === null)
  const stepUp = useStepUp()
  const [batchModal, setBatchModal] = useState(false)
  const [saveGroupModal, setSaveGroupModal] = useState(false)
  const [fileUploaded, setFileUploaded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [rateSeconds, setRateSeconds] = useState(28)
  const [rateLocked, setRateLocked] = useState(false)

  useEffect(() => {
    if (!rateLocked) return
    if (rateSeconds <= 0) {
      setRateLocked(false)
      return
    }
    const timer = window.setInterval(() => setRateSeconds((s) => s - 1), 1000)
    return () => window.clearInterval(timer)
  }, [rateLocked, rateSeconds])

  const recipient = BENEFICIARIES.find((b) => b.id === payout.recipientId)
  const amount = Number(payout.amount)
  const fee = amount > 0 ? amount * 0.01 : 0
  const refunded = amount - fee
  const recipientGets = Math.round(amount * USDC_NGN_RATE)
  const quoteReady = amount > 0 && payout.recipientId !== null

  useEffect(() => {
    if (quoteReady && !rateLocked) {
      setRateSeconds(28)
      setRateLocked(true)
    }
  }, [quoteReady, rateLocked])

  const fmt = (n: number) =>
    n.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  const continueSingle = () => {
    setBusy(true)
    setTimeout(() => navigate({ to: '/payouts/review' }), 900)
  }

  return (
    <main className="mx-auto w-[930px] max-w-[calc(100%-48px)] pt-[58px] pb-16">
      <h1 className="text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
        New payout
      </h1>
      <Separator className="mt-[16px] bg-[#2b2b2b]" />

      <div className="mt-[24px] grid grid-cols-2 gap-[34px]">
        {/* form column */}
        <div>
          <Select
            value={payout.type ?? undefined}
            onValueChange={(v) => payout.setType(v as 'single' | 'bulk')}
            items={[
              { value: 'single', label: 'Single payout' },
              { value: 'bulk', label: 'Bulk payout' },
            ]}
          >
            <SelectTrigger className={SELECT_TRIGGER}>
              <SelectValue placeholder="Single payout" />
            </SelectTrigger>
            <SelectContent className={SELECT_CONTENT}>
              <SelectItem value="single" className={SELECT_ITEM}>
                Single payout
              </SelectItem>
              <SelectItem value="bulk" className={SELECT_ITEM}>
                Bulk payout
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="mt-[8px] text-[13px] text-[#9a9a9a]">
            {payout.type === 'bulk'
              ? 'You are sending money to multiple recipients'
              : 'You are sending money to a single recipient'}
          </p>

          <div className="mt-[16px]">
            <SectionLabel>From</SectionLabel>
            <Select
              value={payout.walletId ?? undefined}
              onValueChange={(v) => payout.setWalletId(String(v))}
              items={WALLETS.map((w) => ({
                value: w.id,
                label: `${w.icon} ${w.label}`,
              }))}
            >
              <SelectTrigger className={SELECT_TRIGGER}>
                <SelectValue placeholder="Select wallet balance" />
              </SelectTrigger>
              <SelectContent className={SELECT_CONTENT}>
                {WALLETS.map((wallet) => (
                  <SelectItem
                    key={wallet.id}
                    value={wallet.id}
                    className={SELECT_ITEM}
                  >
                    <span className="mr-[8px]">{wallet.icon}</span>
                    {wallet.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {payout.walletId ? (
              <p className="mt-[8px] text-[13px] text-[#9a9a9a]">
                Balance:{' '}
                {WALLETS.find((w) => w.id === payout.walletId)?.balance}
              </p>
            ) : null}
          </div>

          {payout.type === 'bulk' ? (
            <>
              <div
                className={`${FORM_BG} mt-[16px] flex h-[52px] items-center gap-3 px-4`}
              >
                <XlsIcon />
                <span className="flex-1 text-[15px] text-[#f5f5f5]">
                  Payout file template
                </span>
                <button
                  type="button"
                  className="flex items-center gap-2 text-sm text-[#f5f5f5] outline-none hover:text-white"
                >
                  <Download aria-hidden="true" className="size-4" />
                  Download template
                </button>
              </div>

              {fileUploaded ? (
                <div className="mt-[10px] flex h-[52px] items-center gap-3 rounded-[10px] bg-[#212121] px-4">
                  <span className="flex size-8 items-center justify-center rounded-full bg-[#30c463] text-white">
                    <CircleCheck
                      className="size-4"
                      fill="currentColor"
                      stroke="#1a1a1a"
                      strokeWidth={2.5}
                    />
                  </span>
                  <div className="leading-tight">
                    <p className="text-[15px] font-medium text-[#f5f5f5]">
                      Payouts doc.xls
                    </p>
                    <p className="text-[13px] text-[#9a9a9a]">10 MB</p>
                  </div>
                  <button
                    type="button"
                    className="ml-auto flex items-center gap-2 text-sm text-[#f5f5f5] outline-none hover:text-white"
                  >
                    <Eye aria-hidden="true" className="size-4" />
                    View recipients
                  </button>
                  <Separator
                    orientation="vertical"
                    className="mx-3 h-5 bg-[#2f2f2f]"
                  />
                  <button
                    type="button"
                    onClick={() => setFileUploaded(false)}
                    className="flex items-center gap-2 text-sm text-[#f5f5f5] outline-none hover:text-white"
                  >
                    <RotateCw aria-hidden="true" className="size-4" />
                    Replace file
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setBusy(true)
                    setTimeout(() => {
                      setBusy(false)
                      setFileUploaded(true)
                    }, 900)
                  }}
                  className={`${FORM_BG} mt-[10px] flex h-[52px] items-center gap-3 px-4 text-left outline-none hover:bg-[#262626] ${busy ? 'opacity-70' : ''}`}
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-[#2f2f2f] text-[#e6e6e6]">
                    <Upload className="size-4" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[15px] font-medium text-[#f5f5f5]">
                      Upload payout file
                    </span>
                    <span className="block text-[13px] text-[#9a9a9a]">
                      Drag & drop or browse · XLS up to 10MB
                    </span>
                  </span>
                  <span className="flex items-center gap-2 text-sm text-[#f5f5f5]">
                    <Plus aria-hidden="true" className="size-4" />
                    Upload
                  </span>
                </button>
              )}

              <div className="mt-[16px] flex items-center gap-4">
                <span className="text-sm text-[#9a9a9a]">Or</span>
                <Separator className="flex-1 bg-[#2b2b2b]" />
              </div>

              <div className="mt-[16px] flex h-[52px] items-center gap-3 rounded-[10px] bg-[#212121] px-4">
                <UserRound
                  aria-hidden="true"
                  className="size-5 text-[#c9c9c9]"
                />
                <span className="flex-1 text-[15px] text-[#f5f5f5]">
                  Create payout group manually
                </span>
                <button
                  type="button"
                  onClick={() => setSaveGroupModal(true)}
                  className="flex items-center gap-2 text-sm text-[#f5f5f5] outline-none hover:text-white"
                >
                  <Plus aria-hidden="true" className="size-4" />
                  Create
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mt-[16px]">
                <SectionLabel>To</SectionLabel>
                <Select
                  value={payout.recipientId ?? undefined}
                  onValueChange={(v) => payout.setRecipientId(String(v))}
                  items={BENEFICIARIES.map((b) => ({
                    value: b.id,
                    label: b.name,
                  }))}
                >
                  <SelectTrigger className={SELECT_TRIGGER}>
                    {recipient ? (
                      <span className="flex items-center gap-2">
                        <CircleCheck
                          className="size-4 text-[#30c463]"
                          fill="currentColor"
                          stroke="#1a1a1a"
                          strokeWidth={2.5}
                        />
                        {recipient.name}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-[#6b6b6b]">
                        <UserRound aria-hidden="true" className="size-4" />
                        Select recipient
                      </span>
                    )}
                  </SelectTrigger>
                  <SelectContent className={SELECT_CONTENT}>
                    {BENEFICIARIES.map((beneficiary) => (
                      <SelectItem
                        key={beneficiary.id}
                        value={beneficiary.id}
                        className={SELECT_ITEM}
                      >
                        {beneficiary.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {recipient ? (
                  <p className="mt-[8px] text-[13px] text-[#9a9a9a]">
                    {recipient.bank} · {recipient.account} · {recipient.country}
                  </p>
                ) : null}
              </div>

              <Separator className="mt-[20px] bg-[#2b2b2b]" />

              <div className="mt-[20px]">
                <SectionLabel>You send</SectionLabel>
                <div
                  className={`${FORM_BG} flex items-center gap-3 px-4 focus-within:bg-[#2a2a2a]`}
                >
                  <input
                    value={payout.amount}
                    onChange={(e) =>
                      payout.setAmount(
                        e.target.value.replace(/[^\d.]/g, '').slice(0, 12),
                      )
                    }
                    placeholder="0.00"
                    aria-label="Amount to send"
                    inputMode="decimal"
                    className="h-[44px] w-full bg-transparent text-[15px] font-medium text-[#e6e6e6] outline-none placeholder:font-normal placeholder:text-[#6b6b6b]"
                  />
                  <span className="flex shrink-0 items-center gap-2 text-[15px] text-[#c9c9c9]">
                    USDC
                    <UsdcBadge className="size-5" />
                  </span>
                </div>
              </div>

              <div className="mt-[16px]">
                <SectionLabel info>Quick actions</SectionLabel>
                <div className="grid grid-cols-3 gap-[2px]">
                  {(['auto-convert', 'hold', 'split'] as const).map(
                    (action, index) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() =>
                          payout.setQuickAction(
                            payout.quickAction === action ? null : action,
                          )
                        }
                        className={`h-11 text-[15px] text-[#f5f5f5] capitalize outline-none transition-colors first:rounded-l-[10px] last:rounded-r-[10px] ${index === 1 ? 'border-x border-[#1a1a1a]' : ''} ${payout.quickAction === action ? 'bg-[#3a3a3a]' : 'bg-[#262626] hover:bg-[#2f2f2f]'}`}
                      >
                        {action === 'auto-convert' ? 'Auto-convert' : action}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="mt-[16px]">
                <SectionLabel>Reference (optional)</SectionLabel>
                <div className={FORM_BG}>
                  <input
                    value={payout.reference}
                    onChange={(e) => payout.setReference(e.target.value)}
                    placeholder="Enter reference"
                    aria-label="Reference"
                    className="h-[44px] w-full bg-transparent px-4 text-[15px] text-[#e6e6e6] outline-none placeholder:text-[#6b6b6b]"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* summary column */}
        <div className="self-start rounded-[16px] bg-[#212121]">
          {payout.type === 'bulk' ? (
            <>
              <div className="flex flex-col gap-[18px] px-5 py-5">
                <div className="flex items-center justify-between text-[15px]">
                  <span className="text-[#9a9a9a]">Verified recipients</span>
                  <span className="text-[#f5f5f5]">
                    {fileUploaded ? '45 of 48' : '0 of 0'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[15px]">
                  <span className="text-[#9a9a9a]">You send</span>
                  <span className="flex items-center gap-2 text-[#f5f5f5]">
                    {fileUploaded ? '11,780' : '0.00'} USDC
                  </span>
                </div>
                <div className="flex items-center justify-between text-[15px]">
                  <span className="text-[#9a9a9a]">Coinmonie fee · 1%</span>
                  <span className="flex items-center gap-2 text-[#f5f5f5]">
                    {fileUploaded ? '118' : '0.00'} USDC
                  </span>
                </div>
              </div>
              <Separator className="bg-[#2f2f2f]" />
              <div className="px-5 py-5">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] text-[#9a9a9a]">
                    Total debit
                  </span>
                  <span className="text-[26px] leading-none font-semibold text-[#fafafa]">
                    {fileUploaded ? '11,898 USDC' : '₦0.00'}
                  </span>
                </div>
                <PrimaryButton
                  type="button"
                  disabled={!fileUploaded}
                  className="mt-[20px]"
                  onClick={async () => {
                    if (await stepUp.require(['twoFactor', 'pin'])) setBatchModal(true)
                  }}
                >
                  {fileUploaded
                    ? 'Approve & pay 45 recipients'
                    : 'Approve & pay'}
                </PrimaryButton>
              </div>
            </>
          ) : (
            <>
              <div className="px-5 py-4">
                <p className="text-lg font-semibold text-[#fafafa]">Quote</p>
              </div>
              <Separator className="bg-[#2f2f2f]" />
              <div className="flex flex-col gap-[18px] px-5 py-5">
                <QuoteRow
                  label="You send"
                  value={`${amount > 0 ? fmt(amount) : '0.00'} USDC`}
                />
                <QuoteRow
                  label="Coinmonie fee · 1%"
                  value={`${fmt(fee)} USDC`}
                />
                <QuoteRow
                  label="Amount refunded"
                  value={`${fmt(refunded)} USDC`}
                />
                <QuoteRow label="Rate" value="1 USDC = 1,631 NGN" />
                {rateLocked ? <RateLockedPill seconds={rateSeconds} /> : null}
              </div>
              <Separator className="bg-[#2f2f2f]" />
              <div className="px-5 py-5">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] text-[#9a9a9a]">
                    Recipient gets
                  </span>
                  <span className="text-[26px] leading-none font-semibold text-[#fafafa]">
                    ₦{recipientGets.toLocaleString('en-US')}
                  </span>
                </div>
                <PrimaryButton
                  type="button"
                  disabled={!quoteReady}
                  loading={busy}
                  onClick={continueSingle}
                  className="mt-[20px]"
                >
                  Continue
                </PrimaryButton>
                <p className="mt-[10px] text-center text-[13px] text-[#9a9a9a]">
                  Estimated settlement · under 30 seconds
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {typeModal ? (
        <PayoutTypeModal
          onPick={(type) => {
            payout.setType(type)
            setTypeModal(false)
          }}
          onClose={() => setTypeModal(false)}
        />
      ) : null}
      {batchModal ? (
        <BatchProcessingModal
          onViewBatch={() => {
            setBatchModal(false)
            navigate({ to: '/payouts/batch' })
          }}
          onDashboard={() => {
            setBatchModal(false)
            navigate({ to: '/dashboard' })
          }}
          onClose={() => setBatchModal(false)}
        />
      ) : null}
      {saveGroupModal ? (
        <SaveGroupModal
          onSave={() => {
            setSaveGroupModal(false)
            navigate({ to: '/payouts/groups/create' })
          }}
          onClose={() => setSaveGroupModal(false)}
        />
      ) : null}
    </main>
  )
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

export function BatchProcessingModal({
  onViewBatch,
  onDashboard,
  onClose,
}: {
  onViewBatch: () => void
  onDashboard: () => void
  onClose: () => void
}) {
  const [saveGroup, setSaveGroup] = useState(true)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div
        role="dialog"
        aria-label="Batch is processing"
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
          Batch is processing
        </h2>
        <p className="mt-[10px] text-sm text-[#9a9a9a]">
          45 payouts are on their way.
        </p>
        <div className="mt-[24px] flex items-center justify-between rounded-[12px] bg-[#2f2f2f] px-4 py-3">
          <span className="text-[15px] font-medium text-[#f5f5f5]">
            Save recipients as payout group
          </span>
          <Switch
            checked={saveGroup}
            onCheckedChange={setSaveGroup}
            aria-label="Save recipients as payout group"
            className="data-checked:bg-white"
          />
        </div>
        <div className="mt-[16px] flex gap-[10px]">
          <button
            type="button"
            onClick={onViewBatch}
            className="h-[48px] flex-1 rounded-[12px] bg-[#2b2b2b] text-sm font-medium text-[#f5f5f5] transition-colors outline-none hover:bg-[#333333]"
          >
            View batch details
          </button>
          <PrimaryButton type="button" onClick={onDashboard} className="flex-1">
            Go to dashboard
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}

export function SaveGroupModal({
  onSave,
  onClose,
}: {
  onSave: () => void
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const enabled = name.trim().length > 0
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div
        role="dialog"
        aria-label="Save payout group"
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
        <WhitePeopleIllustration className="mx-auto" />
        <h2 className="mt-[16px] text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
          Save payout group
        </h2>
        <p className="mt-[8px] text-sm text-[#9a9a9a]">
          Add a name for this payout group
        </p>
        <div className="mt-[24px] text-left">
          <p className="mb-[8px] text-sm text-[#9a9a9a]">Payout group name *</p>
          <div className="flex h-[44px] items-center gap-2 rounded-[10px] bg-[#212121] px-3">
            <UserRound aria-hidden="true" className="size-4 text-[#8a8a8a]" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name"
              aria-label="Payout group name"
              className="h-[42px] w-full bg-transparent text-[15px] text-[#e6e6e6] outline-none placeholder:text-[#6b6b6b]"
            />
          </div>
        </div>
        <div className="mt-[24px] flex gap-[10px]">
          <button
            type="button"
            onClick={onClose}
            className="h-[48px] flex-1 rounded-[12px] bg-[#2b2b2b] text-sm font-medium text-[#f5f5f5] transition-colors outline-none hover:bg-[#333333]"
          >
            Cancel
          </button>
          <PrimaryButton
            type="button"
            disabled={!enabled}
            onClick={onSave}
            className="flex-1"
          >
            Save
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}
