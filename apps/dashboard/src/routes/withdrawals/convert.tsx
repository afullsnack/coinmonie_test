import { requireSession } from '#/lib/session'
import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ChevronDown, Info, Lock } from 'lucide-react'

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
import { FlowFrame, UsdcMark } from '#/components/money/chrome'

export const Route = createFileRoute('/withdrawals/convert')({
  beforeLoad: requireSession,
  head: () => ({ meta: [{ title: 'Convert · CoinMonie' }] }),
  component: ConvertPage,
})

const CURRENCIES = [
  { code: 'USDC', label: 'USDC', balance: '42,800.00 USDC', mark: 'usdc' as const },
  { code: 'NGN', label: 'NGN', balance: '18,450,000 NGN', mark: '🇳🇬' },
  { code: 'GHS', label: 'GHS', balance: '96,200 GHS', mark: '🇬🇭' },
  { code: 'KES', label: 'KES', balance: '1,240,000 KES', mark: '🇰🇪' },
]

const RATES: Record<string, number> = {
  'USDC:NGN': 1631,
  'USDC:GHS': 12.35,
  'USDC:KES': 128.67,
  'NGN:USDC': 1 / 1631,
  'GHS:USDC': 1 / 12.35,
  'KES:USDC': 1 / 128.67,
  'NGN:GHS': 12.35 / 1631,
  'GHS:NGN': 1631 / 12.35,
}

const RECENT = [
  ['USDC → GHS', '2,000 → 24.7k'],
  ['USDC → KES', '1,500 → 193k'],
  ['USDT → NGN', '3,000 → 4.89M'],
]

function ConvertPage() {
  const router = useRouter()
  const [fromCode, setFromCode] = useState('USDC')
  const [toCode, setToCode] = useState('NGN')
  const [amount, setAmount] = useState('')
  const [seconds, setSeconds] = useState(28)

  const numeric = Number(amount.replace(/,/g, ''))
  const active = Number.isFinite(numeric) && numeric > 0
  const rate = RATES[`${fromCode}:${toCode}`] ?? 1
  const converted = active ? numeric * rate : 0

  useEffect(() => {
    if (!active) return
    const timer = window.setInterval(() => {
      setSeconds((current) => (current <= 1 ? 28 : current - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [active])

  const from = CURRENCIES.find((item) => item.code === fromCode) ?? CURRENCIES[0]
  const to = CURRENCIES.find((item) => item.code === toCode) ?? CURRENCIES[1]

  const formattedTo = useMemo(() => formatAmount(converted), [converted])

  return (
    <FlowFrame onBack={() => router.history.back()}>
      <div className="mx-auto mt-10 grid w-full max-w-[920px] gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-white">
            Convert
          </h1>
          <FieldGroup className="mt-6 gap-4">
            <Field>
              <FieldLabel className="text-sm font-normal text-[#9a9a9a]">From</FieldLabel>
              <AmountField
                value={amount}
                onChange={setAmount}
                currency={from}
                onCurrency={(code) => {
                  if (code === toCode) setToCode(fromCode)
                  setFromCode(code)
                }}
              />
              <p className="text-[13px] text-[#8d8d8d]">Balance: {from.balance}</p>
            </Field>
            <Field>
              <FieldLabel className="text-sm font-normal text-[#9a9a9a]">To</FieldLabel>
              <AmountField
                value={active ? formattedTo : ''}
                readOnly
                placeholder="0.00"
                currency={to}
                onCurrency={(code) => {
                  if (code === fromCode) setFromCode(toCode)
                  setToCode(code)
                }}
              />
              <p className="text-[13px] text-[#8d8d8d]">Balance: {to.balance}</p>
            </Field>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#9a9a9a]">Rate</span>
              <span className="font-medium text-white">
                1 {fromCode} = {formatRate(rate)} {toCode}
              </span>
            </div>
            {active ? (
              <div className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#2a2a2a] text-sm text-[#d7d7d7]">
                <Lock className="size-3.5" />
                Rate locked · held for 0:{String(seconds).padStart(2, '0')}
              </div>
            ) : null}
          </FieldGroup>
          <Separator className="my-5 bg-[#2a2a2a]" />
          <PrimaryButton type="button" disabled={!active}>
            {active ? `Convert ${formatAmount(numeric)} ${fromCode}` : 'Convert'}
          </PrimaryButton>
        </div>

        <aside className="h-fit rounded-[18px] border border-[#2a2a2a] bg-[#191919] p-5">
          <h2 className="text-sm font-semibold text-white">How pricing works</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#9a9a9a]">
            The rate includes a transparent spread. There&apos;s no separate conversion fee, and the quote is locked before it executes, so what you see is what you get.
          </p>
          <Separator className="my-4 bg-[#2e2e2e]" />
          <h2 className="text-sm font-semibold text-white">Recent conversions</h2>
          <div className="mt-3 flex flex-col gap-3">
            {RECENT.map(([pair, values]) => (
              <div key={pair} className="flex items-center justify-between text-sm">
                <span className="text-[#cfcfcf]">{pair}</span>
                <span className="text-[#f3f3f3]">{values}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-[12px] text-[#8d8d8d]">
            <Info className="size-3.5" />
            Quotes refresh while you type.
          </p>
        </aside>
      </div>
    </FlowFrame>
  )
}

function AmountField({
  value,
  onChange,
  currency,
  onCurrency,
  readOnly,
  placeholder = '0.00',
}: {
  value: string
  onChange?: (value: string) => void
  currency: (typeof CURRENCIES)[number]
  onCurrency: (code: string) => void
  readOnly?: boolean
  placeholder?: string
}) {
  return (
    <div className="flex h-12 items-center rounded-full bg-[#2a2a2a] pr-2 pl-4">
      <Input
        inputMode="decimal"
        readOnly={readOnly}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value.replace(/[^\d.]/g, ''))}
        className="h-full border-0 bg-transparent px-0 text-[15px] text-white shadow-none placeholder:text-[#8d8d8d] focus-visible:ring-0"
      />
      <DropdownMenu>
        <DropdownMenuTrigger className="flex h-8 items-center gap-1.5 rounded-full px-2 text-sm text-[#f5f5f5] outline-none">
          <CurrencyMark mark={currency.mark} />
          {currency.label}
          <ChevronDown className="size-3.5 text-[#bdbdbd]" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="rounded-[12px] border-[#333] bg-[#2c2c2c] text-[#f5f5f5] ring-0">
          <DropdownMenuGroup>
            {CURRENCIES.map((item) => (
              <DropdownMenuItem
                key={item.code}
                className="gap-2 focus:bg-[#3a3a3a] focus:text-white"
                onClick={() => onCurrency(item.code)}
              >
                <CurrencyMark mark={item.mark} />
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function CurrencyMark({ mark }: { mark: string }) {
  if (mark === 'usdc') return <UsdcMark />
  return <span className="text-base leading-none">{mark}</span>
}

function formatAmount(value: number) {
  if (!value) return '0.00'
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)
}

function formatRate(value: number) {
  if (value >= 100) return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)
}
