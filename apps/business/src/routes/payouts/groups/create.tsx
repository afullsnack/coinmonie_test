import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { CircleCheck, Landmark, Plus, X } from 'lucide-react'

import { PrimaryButton } from '#/components/auth/primary-button'
import { OrbsIllustration } from '#/components/dashboard/illustrations'
import { BankDot, MemberTable } from '#/components/payouts/member-table'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from '#/components/ui/sheet'
import { Separator } from '#/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import type { GroupMember } from '#/components/payouts/payout-context'

export const Route = createFileRoute('/payouts/groups/create')({
  head: () => ({ meta: [{ title: 'Create payout group · CoinMonie' }] }),
  component: CreatePayoutGroup,
})

const MEMBER_COLORS = ['#f0742e', '#3b82f6', '#8b5cf6', '#30c463']

const CURRENCIES = [
  { code: 'NGN', label: 'Naira (₦)', flag: '🇳🇬' },
  { code: 'GHS', label: 'Cedi (₵)', flag: '🇬🇭' },
  { code: 'KES', label: 'Shilling (KSh)', flag: '🇰🇪' },
  { code: 'USDC', label: 'USDC ($)', flag: '$' },
]

const BANKS = ['GTBank', 'Ecobank', 'Access', 'Zenith', 'First Bank']

function titleCase(name: string) {
  return name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatAmount(amount: string, currency: string) {
  const n = Number(amount)
  const symbol =
    currency === 'NGN'
      ? '₦'
      : currency === 'GHS'
        ? 'GHS '
        : currency === 'KES'
          ? 'KES '
          : ''
  return `${symbol}${n.toLocaleString('en-US')}`
}

function CreatePayoutGroup() {
  const [members, setMembers] = useState<GroupMember[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <main className="mx-auto w-[1000px] max-w-[calc(100%-48px)] pt-[58px] pb-16">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
          Create payout group
        </h1>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex h-10 items-center gap-2 rounded-full bg-[#2b2b2b] px-5 text-sm font-medium text-[#f5f5f5] transition-colors outline-none hover:bg-[#333333]"
        >
          <Plus aria-hidden="true" className="size-4" />
          Add member
        </button>
      </div>
      <div className="mt-[16px] h-px bg-[#2b2b2b]" />

      <MemberTable
        className="mt-[20px]"
        members={members}
        onEdit={() => setSheetOpen(true)}
        onRemove={(member) => setMembers((prev) => prev.filter((m) => m.id !== member.id))}
        empty={
          <div className="flex flex-col items-center py-12 text-center">
            <OrbsIllustration />
            <p className="mt-[16px] text-xl font-semibold text-[#fafafa]">
              You don't have member yet
            </p>
            <p className="mt-[6px] text-sm text-[#9a9a9a]">
              Add a members to create your payout group
            </p>
            <PrimaryButton
              type="button"
              onClick={() => setSheetOpen(true)}
              className="mt-[20px] w-auto px-[20px]"
            >
              <Plus aria-hidden="true" className="size-4" />
              Add member
            </PrimaryButton>
          </div>
        }
      />

      <MemberSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSave={(member) => setMembers((prev) => [...prev, member])}
      />
    </main>
  )
}

/** The right-side "Add member" sheet from the design. */
function MemberSheet({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (member: GroupMember) => void
}) {
  const [currency, setCurrency] = useState('')
  const [bank, setBank] = useState('')
  const [account, setAccount] = useState('')
  const [amount, setAmount] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verifiedName, setVerifiedName] = useState<string | null>(null)

  const enabled = currency && bank && verifiedName && Number(amount) > 0

  const reset = () => {
    setCurrency('')
    setBank('')
    setAccount('')
    setAmount('')
    setVerifiedName(null)
  }

  const verify = () => {
    if (account.trim().length < 6) return
    setVerifying(true)
    // UI-only wiring: brief pending state, then the resolved beneficiary card.
    setTimeout(() => {
      setVerifying(false)
      setVerifiedName('JOHN ADEYEMI')
    }, 900)
  }

  const selectedCurrency = CURRENCIES.find((c) => c.code === currency)

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          reset()
          onClose()
        }
      }}
    >
      <SheetContent
        className="gap-0 rounded-l-[20px] border-[#2a2a2a] bg-[#1f1f1f] p-[24px] data-[side=right]:w-[580px] data-[side=right]:max-w-[calc(100vw-24px)] data-[side=right]:sm:max-w-[580px]"
        overlayClassName="bg-black/60 backdrop-blur-xs"
        showCloseButton={false}
      >
        <div className="flex items-center justify-between">
          <SheetTitle className="text-xl font-semibold text-[#fafafa]">
            Add member
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

        <div className="mt-[20px]">
          <p className="mb-[8px] text-sm text-[#9a9a9a]">Currency</p>
          <Select
            value={currency || undefined}
            onValueChange={(v) => setCurrency(String(v))}
            items={CURRENCIES.map((c) => ({
              value: c.code,
              label: `${c.flag} ${c.label}`,
            }))}
          >
            <SelectTrigger className="h-[48px] w-full justify-between rounded-[10px] border-transparent bg-[#282828] px-[12px] text-[15px] text-[#e6e6e6] data-[placeholder]:text-[#6b6b6b] hover:bg-[#282828] focus-visible:ring-0">
              {selectedCurrency ? (
                <span className="text-base leading-none">
                  {selectedCurrency.flag}
                </span>
              ) : null}
              <SelectValue placeholder="Select a currency" />
            </SelectTrigger>
            <SelectContent className="rounded-[12px] border border-[#2f2f2f] bg-[#262626] p-[6px] text-[#e6e6e6] ring-0">
              {CURRENCIES.map((c) => (
                <SelectItem
                  key={c.code}
                  value={c.code}
                  className="rounded-[8px] px-[10px] py-[8px] text-[15px] data-highlighted:bg-[#333333]"
                >
                  <span className="mr-[8px]">{c.flag}</span>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-[8px] text-[13px] text-[#9a9a9a]">
            Which currency does this beneficiary accept
          </p>
        </div>
        <Separator className="mt-[20px] bg-[#2b2b2b]" />

        {currency ? (
          <>
            <div className="mt-[20px]">
              <p className="mb-[8px] text-sm text-[#9a9a9a]">Bank</p>
              <Select
                value={bank || undefined}
                onValueChange={(v) => {
                  setBank(String(v))
                  setVerifiedName(null)
                }}
                items={BANKS.map((b) => ({ value: b, label: b }))}
              >
                <SelectTrigger className="h-[48px] w-full justify-between rounded-[10px] border-transparent bg-[#282828] px-[12px] text-[15px] text-[#e6e6e6] data-[placeholder]:text-[#6b6b6b] hover:bg-[#282828] focus-visible:ring-0">
                  <span className="flex items-center gap-2">
                    {bank ? (
                      <BankDot bank={bank} />
                    ) : (
                      <Landmark
                        aria-hidden="true"
                        className="size-4 text-[#8a8a8a]"
                      />
                    )}
                    <SelectValue placeholder="Select a bank" />
                  </span>
                </SelectTrigger>
                <SelectContent className="rounded-[12px] border border-[#2f2f2f] bg-[#262626] p-[6px] text-[#e6e6e6] ring-0">
                  {BANKS.map((b) => (
                    <SelectItem
                      key={b}
                      value={b}
                      className="rounded-[8px] px-[10px] py-[8px] text-[15px] data-highlighted:bg-[#333333]"
                    >
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-[16px]">
              <p className="mb-[8px] text-sm text-[#9a9a9a]">Account number</p>
              <div className="flex gap-[10px]">
                <input
                  value={account}
                  onChange={(e) => {
                    setAccount(e.target.value.replace(/\D/g, '').slice(0, 10))
                    setVerifiedName(null)
                  }}
                  placeholder="Enter account number"
                  aria-label="Account number"
                  inputMode="numeric"
                  className="h-[48px] flex-1 rounded-[10px] bg-[#282828] px-4 text-[15px] text-[#e6e6e6] outline-none transition-colors placeholder:text-[#6b6b6b] focus:bg-[#2f2f2f]"
                />
                <button
                  type="button"
                  onClick={verify}
                  disabled={account.trim().length < 6 || verifying}
                  className={
                    account.trim().length >= 6 && !verifying
                      ? 'h-[48px] rounded-[10px] bg-[#2f2f2f] px-[20px] text-sm font-medium text-[#f5f5f5] transition-colors outline-none hover:bg-[#3a3a3a]'
                      : 'h-[48px] rounded-[10px] bg-[#2f2f2f] px-[20px] text-sm font-medium text-[#9a9a9a] outline-none'
                  }
                >
                  Verify
                </button>
              </div>
              {verifying ? (
                <p className="mt-[10px] text-[13px] text-[#9a9a9a]">
                  Verifying account…
                </p>
              ) : null}
              {verifiedName ? (
                <div className="mt-[14px] flex items-center gap-3 rounded-[12px] bg-[#17301f] px-4 py-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#30c463] text-[13px] font-semibold text-white">
                    JA
                  </span>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-[#f5f5f5]">
                      {verifiedName}
                    </p>
                    <p className="text-[13px] text-[#9a9a9a]">
                      {bank} · {account}
                    </p>
                  </div>
                  <CircleCheck
                    className="ml-auto size-5 text-[#30c463]"
                    fill="currentColor"
                    stroke="#17301f"
                    strokeWidth={2.5}
                  />
                </div>
              ) : null}
            </div>

            <div className="mt-[16px]">
              <p className="mb-[8px] text-sm text-[#9a9a9a]">How much</p>
              <div className="flex h-[48px] items-center rounded-[10px] bg-[#282828] px-4 focus-within:bg-[#2f2f2f]">
                <input
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      e.target.value.replace(/[^\d.]/g, '').slice(0, 15),
                    )
                  }
                  placeholder="0.00"
                  aria-label="Amount"
                  inputMode="decimal"
                  className="h-[46px] w-full bg-transparent text-[15px] font-medium text-[#e6e6e6] outline-none placeholder:font-normal placeholder:text-[#6b6b6b]"
                />
                <span className="flex shrink-0 items-center gap-2 text-sm text-[#c9c9c9]">
                  {currency}
                  <span className="text-base leading-none">
                    {selectedCurrency?.flag}
                  </span>
                </span>
              </div>
              <p className="mt-[8px] text-[13px] text-[#9a9a9a]">
                Balance: 42,800.00
              </p>
            </div>
          </>
        ) : null}

        <div className="mt-auto pt-[24px]">
          <div className="flex gap-[10px]">
            <button
              type="button"
              onClick={() => {
                reset()
                onClose()
              }}
              className="h-[48px] flex-1 rounded-[12px] bg-[#2b2b2b] text-sm font-medium text-[#f5f5f5] transition-colors outline-none hover:bg-[#333333]"
            >
              Cancel
            </button>
            <PrimaryButton
              type="button"
              disabled={!enabled}
              onClick={() => {
                onSave({
                  id: crypto.randomUUID(),
                  name: titleCase(verifiedName ?? 'New Beneficiary'),
                  note: 'Payroll',
                  bank,
                  account,
                  amount: formatAmount(amount, currency),
                  color:
                    MEMBER_COLORS[
                      Math.floor(Math.random() * MEMBER_COLORS.length)
                    ],
                })
                reset()
                onClose()
              }}
              className="flex-1"
            >
              Save beneficiary
            </PrimaryButton>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
