import { requireSession } from '#/lib/session'
import { useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ChevronDown } from 'lucide-react'
import { z } from 'zod'

import { PrimaryButton } from '#/components/auth/primary-button'
import { Field, FieldGroup, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Separator } from '#/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { FlowFrame, Initials, SavedToast, UsdcMark } from '#/components/money/chrome'
import { SAVED_ACCOUNTS } from '#/components/withdrawals/bank-account-modal'

const searchSchema = z.object({
  account: z.string().optional(),
  name: z.string().optional(),
  bank: z.string().optional(),
  masked: z.string().optional(),
  color: z.string().optional(),
  added: z.boolean().optional(),
})

export const Route = createFileRoute('/withdrawals/withdraw')({
  beforeLoad: requireSession,
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: 'Withdraw · CoinMonie' }] }),
  component: WithdrawPage,
})

const CURRENCIES = [
  { code: 'USDC', mark: 'usdc' as const, balance: '42,800.00' },
  { code: 'NGN', mark: '🇳🇬', balance: '18,450,000' },
  { code: 'GHS', mark: '🇬🇭', balance: '96,200' },
]

function WithdrawPage() {
  const router = useRouter()
  const search = Route.useSearch()
  const saved = SAVED_ACCOUNTS.find((item) => item.id === search.account)
  const account = saved ?? {
    id: search.account ?? SAVED_ACCOUNTS[0].id,
    name: search.name ?? SAVED_ACCOUNTS[0].name,
    bank: search.bank ?? SAVED_ACCOUNTS[0].bank,
    masked: search.masked ?? SAVED_ACCOUNTS[0].masked,
    color: search.color ?? SAVED_ACCOUNTS[0].color,
  }
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [toast, setToast] = useState(search.added === true)
  const numeric = Number(amount.replace(/,/g, ''))
  const ready = Number.isFinite(numeric) && numeric > 0

  return (
    <FlowFrame
      onBack={() => router.history.back()}
      toast={
        toast ? (
          <SavedToast onClose={() => setToast(false)}>
            Bank account added successfully
          </SavedToast>
        ) : null
      }
    >
      <div className="mx-auto mt-16 w-full max-w-[440px]">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-white">
          Withdraw
        </h1>
        <Separator className="mt-4 bg-[#2a2a2a]" />
        <FieldGroup className="mt-5 gap-4">
          <Field>
            <FieldLabel className="text-sm font-normal text-[#9a9a9a]">
              You&apos;re withdrawing to
            </FieldLabel>
            <div className="flex h-14 items-center gap-3 rounded-full bg-[#2a2a2a] px-3">
              <Initials color={account.color} className="size-9 text-[10px]">
                {account.bank.slice(0, 4)}
              </Initials>
              <div className="min-w-0 leading-tight">
                <p className="text-sm font-medium text-white">{account.name}</p>
                <p className="text-[13px] text-[#9a9a9a]">
                  {account.masked}{' '}
                  <span className="ml-2">{account.bank}</span>
                </p>
              </div>
            </div>
          </Field>
          <Field>
            <FieldLabel className="text-sm font-normal text-[#9a9a9a]">
              How much
            </FieldLabel>
            <div className="flex h-12 items-center rounded-full bg-[#2a2a2a] pr-2 pl-4">
              <Input
                inputMode="decimal"
                value={amount}
                placeholder="0.00"
                onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))}
                className="h-full border-0 bg-transparent px-0 text-[15px] text-white shadow-none placeholder:text-[#8d8d8d] focus-visible:ring-0"
              />
              <DropdownMenu>
                <DropdownMenuTrigger className="flex h-8 items-center gap-1.5 rounded-full px-2 text-sm text-[#f5f5f5] outline-none">
                  {currency.mark === 'usdc' ? <UsdcMark /> : <span>{currency.mark}</span>}
                  {currency.code}
                  <ChevronDown className="size-3.5 text-[#bdbdbd]" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-[12px] border-[#333] bg-[#2c2c2c] text-[#f5f5f5] ring-0">
                  <DropdownMenuGroup>
                    {CURRENCIES.map((item) => (
                      <DropdownMenuItem
                        key={item.code}
                        className="gap-2 focus:bg-[#3a3a3a] focus:text-white"
                        onClick={() => setCurrency(item)}
                      >
                        {item.mark === 'usdc' ? <UsdcMark /> : <span>{item.mark}</span>}
                        {item.code}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-[13px] text-[#8d8d8d]">Balance: {currency.balance}</p>
          </Field>
        </FieldGroup>
        <Separator className="my-5 bg-[#2a2a2a]" />
        <PrimaryButton type="button" disabled={!ready}>
          Continue
        </PrimaryButton>
      </div>
    </FlowFrame>
  )
}
