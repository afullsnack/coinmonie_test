import { useState } from 'react'
import { Landmark, Plus, X } from 'lucide-react'

import { PrimaryButton } from '#/components/auth/primary-button'
import { Checkbox } from '#/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Separator } from '#/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { SAVED_ACCOUNTS, type BankAccount } from '#/components/withdrawals/bank-account-modal'
import { Initials } from '#/components/money/chrome'

const BANKS = ['GTBank', 'Access Bank', 'Ecobank', '5TT Microfinance Bank', '9jaPay Microfinance Bank']

export function DestinationDialog({
  open,
  onOpenChange,
  onContinue,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onContinue: (account: BankAccount, added: boolean) => void
}) {
  const [accounts, setAccounts] = useState(SAVED_ACCOUNTS)
  const [selected, setSelected] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  return (
    <>
      <Dialog
        open={open && !adding}
        onOpenChange={(next) => {
          if (!next) {
            setSelected(null)
            onOpenChange(false)
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          overlayClassName="bg-black/60 backdrop-blur-md"
          className="w-[460px] max-w-[calc(100%-32px)] gap-0 rounded-[22px] bg-[#2a2a2a] p-5 text-[#f5f5f5] ring-0 sm:max-w-[460px]"
        >
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[18px] font-semibold text-white">
              Select withdrawal destination
            </DialogTitle>
            <button
              type="button"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
              className="text-[#e8e8e8] outline-none hover:text-white"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="mt-4 flex flex-col">
            {accounts.map((account, index) => (
              <div key={account.id}>
                {index > 0 ? <Separator className="bg-[#3a3a3a]" /> : null}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected(account.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') setSelected(account.id)
                  }}
                  className="flex w-full items-center gap-3 py-3 text-left outline-none"
                >
                  <Initials color={account.color} className="size-9 text-[10px]">
                    {account.bank.slice(0, 2).toUpperCase()}
                  </Initials>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">{account.name}</p>
                    <p className="text-[13px] text-[#9a9a9a]">{account.masked}</p>
                  </div>
                  <span className="rounded-md bg-[#3a3a3a] px-2 py-0.5 text-[12px] text-[#d0d0d0]">
                    {account.bank}
                  </span>
                  <Checkbox
                    checked={selected === account.id}
                    onCheckedChange={() => setSelected(account.id)}
                    aria-label={`Select ${account.bank}`}
                    className="border-[#5a5a5a] data-checked:border-white data-checked:bg-white data-checked:text-[#1a1a1a]"
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-2 flex h-12 w-full items-center justify-between rounded-[12px] bg-[#232323] px-4 text-sm text-[#f3f3f3] outline-none hover:bg-[#303030]"
          >
            Add bank account
            <span className="flex items-center gap-1 text-[#d0d0d0]">
              <Plus className="size-4" />
              Add
            </span>
          </button>
          <PrimaryButton
            type="button"
            disabled={!selected}
            className="mt-3"
            onClick={() => {
              const account = accounts.find((item) => item.id === selected)
              if (!account) return
              onContinue(account, false)
              onOpenChange(false)
            }}
          >
            Continue
          </PrimaryButton>
        </DialogContent>
      </Dialog>

      <AddDestinationDialog
        open={adding}
        onOpenChange={setAdding}
        onSaved={(account) => {
          setAccounts((current) => [account, ...current])
          setAdding(false)
          onOpenChange(false)
          onContinue(account, true)
        }}
      />
    </>
  )
}

function AddDestinationDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (account: BankAccount) => void
}) {
  const [accountNumber, setAccountNumber] = useState('')
  const [bank, setBank] = useState('')
  const ready = accountNumber.trim().length >= 10 && bank !== ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/60 backdrop-blur-md"
        className="w-[460px] max-w-[calc(100%-32px)] gap-4 rounded-[22px] bg-[#2a2a2a] p-5 text-[#f5f5f5] ring-0 sm:max-w-[460px]"
      >
        <div className="flex items-center justify-between">
          <DialogTitle className="text-[18px] font-semibold text-white">
            Add bank account
          </DialogTitle>
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="text-[#e8e8e8] outline-none hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>
        <label className="flex flex-col gap-2 text-sm text-[#bdbdbd]">
          Account number
          <Input
            value={accountNumber}
            onChange={(event) => setAccountNumber(event.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="Enter your account number"
            className="h-12 rounded-[12px] border-0 bg-[#1c1c1c] px-4 text-[#f5f5f5] placeholder:text-[#7d7d7d]"
          />
        </label>
        <div className="flex flex-col gap-2">
          <span className="text-sm text-[#bdbdbd]">Bank</span>
          <Select
            value={bank || undefined}
            onValueChange={(value) => setBank(String(value))}
            items={BANKS.map((name) => ({ value: name, label: name }))}
          >
            <SelectTrigger className="h-12 w-full rounded-[12px] border-0 bg-[#1c1c1c] px-4 text-sm text-[#f5f5f5] data-placeholder:text-[#7d7d7d]">
              <span className="flex items-center gap-2">
                <Landmark className="size-4 text-[#9a9a9a]" />
                <SelectValue placeholder="Select bank" />
              </span>
            </SelectTrigger>
            <SelectContent className="rounded-[12px] border-[#333] bg-[#2a2a2a] text-[#f5f5f5]">
              <SelectGroup>
                {BANKS.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <PrimaryButton
          type="button"
          disabled={!ready}
          onClick={() =>
            onSaved({
              id: crypto.randomUUID(),
              name: 'John Evans Doe',
              masked: `••••${accountNumber.slice(-4)}`,
              bank,
              color: '#f0742e',
            })
          }
        >
          Continue
        </PrimaryButton>
      </DialogContent>
    </Dialog>
  )
}
