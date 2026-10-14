import { useEffect, useState } from 'react'
import { Check, Landmark, X } from 'lucide-react'
import { cn } from "cn"

import { PrimaryButton } from '#/components/auth/primary-button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

export interface BankAccount {
  id: string
  name: string
  masked: string
  bank: string
  color: string
}

export const SAVED_ACCOUNTS: BankAccount[] = [
  { id: 'gtb', name: 'John Evans Doe', masked: '••••9042', bank: 'GTBank', color: '#f0742e' },
  { id: 'access', name: 'John Evans Doe', masked: '••••2218', bank: 'Access Bank', color: '#e8eef2' },
]

const BANK_OPTIONS = [
  { name: '5TT Microfinance Bank', color: '#7b5cf0' },
  { name: '9jaPay Microfinance Bank', color: '#2e9e5b' },
  { name: 'Above Only MFB', color: '#3a9e3a' },
  { name: 'Ada MFB', color: '#f0f0f0' },
  { name: 'GTBank', color: '#f0742e' },
  { name: 'Access Bank', color: '#e8eef2' },
]

/** The "Add bank account" modal: account number auto-verifies, then a bank. */
export function BankAccountModal({
  onSaved,
  onClose,
}: {
  onSaved: (account: BankAccount) => void
  onClose: () => void
}) {
  const [account, setAccount] = useState('')
  const [bank, setBank] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verifiedName, setVerifiedName] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (account.length !== 10 || verifiedName) return
    setVerifying(true)
    const timer = window.setTimeout(() => {
      setVerifying(false)
      setVerifiedName('John Evans Doe')
    }, 900)
    return () => window.clearTimeout(timer)
  }, [account, verifiedName])

  const enabled = verifiedName !== null && bank !== ''

  const save = () => {
    if (!enabled) return
    setSaving(true)
    // UI-only wiring: brief pending state, then the saved account.
    setTimeout(() => {
      setSaving(false)
      const chosen = BANK_OPTIONS.find((b) => b.name === bank)
      onSaved({
        id: crypto.randomUUID(),
        name: verifiedName ?? '',
        masked: `••••${account.slice(-4)}`,
        bank,
        color: chosen?.color ?? '#4a4a4a',
      })
    }, 900)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div
        role="dialog"
        aria-label="Add bank account"
        className="relative w-[600px] max-w-[calc(100%-48px)] rounded-[24px] bg-[#262626] p-[28px]"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-[22px] right-[22px] text-[#e6e6e6] outline-none hover:text-white"
        >
          <X className="size-[22px]" />
        </button>

        <h2 className="text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
          Add bank account
        </h2>

        <div className="mt-[24px]">
          <p className="mb-[8px] text-sm text-[#9a9a9a]">Account number</p>
          <div className="flex h-[48px] items-center rounded-[10px] bg-[#212121] px-4 focus-within:bg-[#2a2a2a]">
            <input
              value={account}
              onChange={(e) => setAccount(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter your account number"
              aria-label="Account number"
              inputMode="numeric"
              className="h-[46px] w-full bg-transparent text-[15px] text-[#e6e6e6] outline-none placeholder:text-[#6b6b6b]"
            />
          </div>
          {verifying ? (
            <div className="mt-[10px] flex h-[48px] items-center rounded-[10px] bg-[#212121] px-4 text-sm text-[#9a9a9a]">
              Verifying…
            </div>
          ) : verifiedName ? (
            <div className="mt-[10px] flex h-[48px] items-center gap-2 rounded-[10px] bg-[#212121] px-4">
              <Check aria-hidden="true" className="size-4 text-[#30c463]" />
              <span className="text-[15px] font-medium text-[#f5f5f5]">{verifiedName}</span>
            </div>
          ) : null}
        </div>

        <div className="mt-[16px]">
          <p className="mb-[8px] text-sm text-[#9a9a9a]">Bank</p>
          <Select
            value={bank || undefined}
            onValueChange={(v) => setBank(String(v))}
            items={BANK_OPTIONS.map((b) => ({ value: b.name, label: b.name }))}
          >
            <SelectTrigger className="h-[48px] w-full justify-between rounded-[10px] border-transparent bg-[#212121] px-[12px] text-[15px] text-[#e6e6e6] data-[placeholder]:text-[#6b6b6b] hover:bg-[#212121] focus-visible:ring-0 open:bg-[#2a2a2a]">
              <span className="flex items-center gap-2">
                {bank ? (
                  <BankDot color={BANK_OPTIONS.find((b) => b.name === bank)?.color ?? '#4a4a4a'} light={bank === 'Access Bank'} />
                ) : (
                  <Landmark aria-hidden="true" className="size-4 text-[#8a8a8a]" />
                )}
                <SelectValue placeholder="Search or select bank" />
              </span>
            </SelectTrigger>
            <SelectContent className="rounded-[12px] border border-[#2f2f2f] bg-[#262626] p-[6px] text-[#e6e6e6] ring-0">
              {BANK_OPTIONS.map((option) => (
                <SelectItem
                  key={option.name}
                  value={option.name}
                  className="rounded-[8px] px-[10px] py-[8px] text-[15px] data-highlighted:bg-[#333333]"
                >
                  <span className="mr-[8px]">{option.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <PrimaryButton
          type="button"
          disabled={!enabled}
          loading={saving}
          onClick={save}
          className="mt-[24px]"
        >
          {enabled ? 'Save' : 'Continue'}
        </PrimaryButton>
      </div>
    </div>
  )
}

export function BankDot({ color, light }: { color: string; light?: boolean }) {
  return (
    <span
      className="flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
      style={{ backgroundColor: color, color: light ? '#1a1a1a' : '#ffffff' }}
    >
      •
    </span>
  )
}
