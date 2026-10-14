import { requireSession } from '#/lib/session'
import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { Check, Landmark } from 'lucide-react'

import { PrimaryButton } from '#/components/auth/primary-button'
import { useStepUp } from '#/components/auth/step-up'
import { ClockMark, FailMark, FlowFrame, SuccessCloud } from '#/components/money/chrome'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '#/components/ui/dialog'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Separator } from '#/components/ui/separator'

export const Route = createFileRoute('/add-bank-account')({
  beforeLoad: requireSession,
  head: () => ({ meta: [{ title: 'Add bank account · CoinMonie' }] }),
  component: AddBankAccountPage,
})

const BANKS = [
  { name: '5TT Microfinance Bank', color: '#7b5cf0' },
  { name: '9jaPay Microfinance Bank', color: '#2e9e5b' },
  { name: 'Above Only MFB', color: '#3a9e3a' },
  { name: 'Ada MFB', color: '#d9d9d9' },
  { name: 'GT Bank', color: '#f0742e' },
  { name: 'Access Bank', color: '#f4f7fa' },
]

type Phase = 'form' | 'verifying' | 'verified' | 'success' | 'failed'

function AddBankAccountPage() {
  const router = useRouter()
  const navigate = useNavigate()
  const [bankQuery, setBankQuery] = useState('')
  const [bankOpen, setBankOpen] = useState(false)
  const [bank, setBank] = useState<(typeof BANKS)[number] | null>(null)
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const stepUp = useStepUp()
  const [phase, setPhase] = useState<Phase>('form')

  const banks = useMemo(() => {
    const query = bankQuery.trim().toLowerCase()
    if (!query || bank) return BANKS
    return BANKS.filter((item) => item.name.toLowerCase().includes(query))
  }, [bank, bankQuery])

  const canVerify = Boolean(bank && accountNumber.length >= 10 && accountName.trim())
  const showSave = phase === 'verified' || phase === 'success'

  useEffect(() => {
    if (phase !== 'verifying') return
    const timer = window.setTimeout(() => {
      setPhase(accountNumber.endsWith('0000') ? 'failed' : 'verified')
    }, 1400)
    return () => window.clearTimeout(timer)
  }, [accountNumber, phase])

  return (
    <FlowFrame onBack={() => router.history.back()}>
      <div className="relative mx-auto mt-16 w-full max-w-[440px]">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-white">
          Add bank account
        </h1>
        <p className="mt-1 text-sm text-[#9a9a9a]">
          Add your business bank account to receive money from CoinMonie.
        </p>
        <FieldGroup className="mt-6 gap-4">
          <Field className="relative">
            <FieldLabel className="text-sm font-normal text-[#9a9a9a]">Bank</FieldLabel>
            <div className="flex h-12 items-center gap-2 rounded-[12px] bg-[#2a2a2a] px-4">
              {bank ? (
                <BankDot color={bank.color} />
              ) : (
                <Landmark className="size-4 text-[#8d8d8d]" />
              )}
              <Input
                value={bank ? bank.name : bankQuery}
                placeholder="Select or search for bank"
                onClick={() => setBankOpen(true)}
                onFocus={() => setBankOpen(true)}
                onChange={(event) => {
                  setBank(null)
                  setBankQuery(event.target.value)
                  setBankOpen(true)
                  if (phase === 'verified') setPhase('form')
                }}
                className="h-full border-0 bg-transparent px-0 text-sm text-white shadow-none placeholder:text-[#8d8d8d] focus-visible:ring-0"
              />
            </div>
            {bankOpen ? (
              <div className="absolute top-[78px] z-10 w-full rounded-[14px] border border-[#333] bg-[#242424] p-2 shadow-xl">
                {banks.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      setBank(item)
                      setBankQuery('')
                      setBankOpen(false)
                    }}
                    className="flex h-10 w-full items-center gap-2 rounded-[10px] px-2 text-left text-sm text-[#f3f3f3] outline-none hover:bg-[#333]"
                  >
                    <BankDot color={item.color} />
                    {item.name}
                  </button>
                ))}
              </div>
            ) : null}
          </Field>
          <Field>
            <FieldLabel htmlFor="account-number" className="text-sm font-normal text-[#9a9a9a]">
              Account number
            </FieldLabel>
            <Input
              id="account-number"
              inputMode="numeric"
              value={accountNumber}
              placeholder="Enter account number"
              onChange={(event) => {
                setAccountNumber(event.target.value.replace(/\D/g, '').slice(0, 10))
                if (phase === 'verified') setPhase('form')
              }}
              className="h-12 rounded-[12px] border-0 bg-[#2a2a2a] px-4 text-sm text-white placeholder:text-[#8d8d8d]"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="account-name" className="text-sm font-normal text-[#9a9a9a]">
              Account name
            </FieldLabel>
            <div className="relative">
              <Input
                id="account-name"
                value={accountName}
                placeholder="Enter account name"
                onChange={(event) => {
                  setAccountName(event.target.value)
                  if (phase === 'verified') setPhase('form')
                }}
                className="h-12 rounded-[12px] border-0 bg-[#2a2a2a] px-4 pr-10 text-sm text-white placeholder:text-[#8d8d8d]"
              />
              {phase === 'verified' ? (
                <Check className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[#3ddc84]" />
              ) : null}
            </div>
            {phase === 'verified' ? (
              <FieldDescription className="text-[#3ddc84]">
                Account name matches this bank account.
              </FieldDescription>
            ) : null}
          </Field>
        </FieldGroup>
        <Separator className="my-5 bg-[#2a2a2a]" />
        <PrimaryButton
          type="button"
          disabled={showSave ? false : !canVerify}
          onClick={async () => {
            if (!showSave) {
              setPhase('verifying')
              return
            }
            if (await stepUp.require(['twoFactor', 'pin'])) setPhase('success')
          }}
        >
          {showSave ? 'Save bank account' : 'Verify account'}
        </PrimaryButton>
      </div>

      {phase === 'verifying' ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 backdrop-blur-md">
          <div className="flex flex-col items-center gap-3 text-center">
            <ClockMark />
            <p className="text-xl font-semibold text-white">Verifying account number</p>
            <p className="text-sm text-[#bdbdbd]">This usually takes less than 30 seconds.</p>
            <span className="mt-2 flex gap-1.5">
              <Dot />
              <Dot className="opacity-70" />
              <Dot className="opacity-40" />
            </span>
          </div>
        </div>
      ) : null}

      <Dialog open={phase === 'success'} onOpenChange={() => navigate({ to: '/dashboard' })}>
        <DialogContent
          overlayClassName="bg-black/60 backdrop-blur-md"
          className="w-[440px] rounded-[22px] bg-[#2a2a2a] p-6 text-center ring-0 sm:max-w-[440px]"
        >
          <SuccessCloud />
          <DialogTitle className="text-xl font-semibold text-white">Bank account added</DialogTitle>
          <DialogDescription>Your bank account is now ready to receive payouts.</DialogDescription>
          <PrimaryButton type="button" onClick={() => navigate({ to: '/dashboard' })}>
            Go to dashboard
          </PrimaryButton>
        </DialogContent>
      </Dialog>

      <Dialog open={phase === 'failed'} onOpenChange={(open) => !open && setPhase('form')}>
        <DialogContent
          overlayClassName="bg-black/60 backdrop-blur-md"
          className="w-[440px] rounded-[22px] bg-[#2a2a2a] p-6 text-center ring-0 sm:max-w-[440px]"
        >
          <FailMark />
          <DialogTitle className="text-xl font-semibold text-white">
            We couldn&apos;t verify this account
          </DialogTitle>
          <DialogDescription>Check that the bank and account number are correct.</DialogDescription>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPhase('form')}
              className="h-12 flex-1 rounded-[12px] bg-[#3a3a3a] text-sm font-medium text-white outline-none"
            >
              Back
            </button>
            <PrimaryButton type="button" className="flex-1" onClick={() => setPhase('verifying')}>
              Try again
            </PrimaryButton>
          </div>
        </DialogContent>
      </Dialog>
    </FlowFrame>
  )
}

function BankDot({ color }: { color: string }) {
  return <span className="size-5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
}

function Dot({ className }: { className?: string }) {
  return <span className={`size-2 rounded-full bg-white ${className ?? ''}`} />
}
