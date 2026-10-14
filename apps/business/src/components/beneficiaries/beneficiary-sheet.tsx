import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Check, ChevronDown, ClipboardPaste, Landmark, LoaderCircle, Search, ShieldAlert, X } from 'lucide-react'

import { PrimaryButton } from '#/components/auth/primary-button'
import { SuccessCloud, UsdcMark } from '#/components/money/chrome'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '#/components/ui/dialog'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Separator } from '#/components/ui/separator'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from '#/components/ui/sheet'
import { Flag } from '#/components/money/flag'

export type BeneficiaryDraft = {
  id: string
  name: string
  initials: string
  color: string
  kind: 'individual' | 'group'
  rail: 'bank' | 'wallet'
  bank: string
  account: string
  country: string
  flag: string
  currency: string
  status: 'Pending' | 'Verified'
  lastPaid: string
  network?: string
  address?: string
}

const CURRENCIES = [
  { id: 'NGN', name: 'Naira (₦)', flag: '🇳🇬', rail: 'bank' as const, country: 'Nigeria' },
  { id: 'GHS', name: 'Cedi (₵)', flag: '🇬🇭', rail: 'bank' as const, country: 'Ghana' },
  { id: 'KES', name: 'Shilling', flag: '🇰🇪', rail: 'bank' as const, country: 'Kenya' },
  { id: 'USDC', name: 'USDC', flag: 'usdc', rail: 'wallet' as const, country: 'Stablecoin' },
]

const BANKS = [
  { name: 'GTBank', color: '#f0742e' },
  { name: 'Access', color: '#f4f7fa' },
  { name: 'Ecobank', color: '#2f6fed' },
  { name: '5TT Microfinance Bank', color: '#7b5cf0' },
]

const NETWORKS = ['TRON (TRC20)', 'Ethereum (ERC20)', 'Solana (SOL)']

export function BeneficiarySheet({
  open,
  mode,
  initial,
  onOpenChange,
  onSave,
}: {
  open: boolean
  mode: 'add' | 'edit'
  initial?: BeneficiaryDraft | null
  onOpenChange: (open: boolean) => void
  onSave: (beneficiary: BeneficiaryDraft) => void
}) {
  const [currency, setCurrency] = useState(initial?.currency ?? '')
  const [bank, setBank] = useState(initial?.bank ?? '')
  const [account, setAccount] = useState(initial?.rail === 'bank' ? initial.account : '')
  const [network, setNetwork] = useState(initial?.network ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')
  const [nickname, setNickname] = useState(initial?.name ?? '')
  const [networkOpen, setNetworkOpen] = useState(false)
  const [networkQuery, setNetworkQuery] = useState('')
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [bankOpen, setBankOpen] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(mode === 'edit' && initial?.rail === 'bank')
  const [savedOpen, setSavedOpen] = useState(false)
  const navigate = useNavigate()

  const selected = CURRENCIES.find((item) => item.id === currency)
  const rail = selected?.rail
  const dirty =
    mode === 'add' ||
    nickname !== (initial?.name ?? '') ||
    bank !== (initial?.bank ?? '') ||
    account !== (initial?.rail === 'bank' ? initial.account : '') ||
    address !== (initial?.address ?? '') ||
    network !== (initial?.network ?? '') ||
    currency !== (initial?.currency ?? '')

  const canSave =
    Boolean(selected) &&
    nickname.trim().length > 0 &&
    dirty &&
    (rail === 'wallet' ? network !== '' && address.trim().length > 6 : verified)

  const resetAndClose = () => {
    onOpenChange(false)
  }

  const save = () => {
    if (!selected || !canSave) return
    const draft: BeneficiaryDraft = {
      id: initial?.id ?? crypto.randomUUID(),
      name: nickname.trim(),
      initials: nickname
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join(''),
      color: initial?.color ?? '#7c5cbf',
      kind: initial?.kind ?? 'individual',
      rail: selected.rail,
      bank: selected.rail === 'bank' ? bank : network.replace(/ \(.*/, ''),
      account: selected.rail === 'bank' ? account : shorten(address),
      country: selected.country,
      flag: selected.flag,
      currency: selected.id,
      status: 'Pending',
      lastPaid: initial?.lastPaid ?? '—',
      network: selected.rail === 'wallet' ? network.replace(/ \(.*/, '') : undefined,
      address: selected.rail === 'wallet' ? address : undefined,
    }
    onSave(draft)
    if (mode === 'add') setSavedOpen(true)
    else onOpenChange(false)
  }

  const verify = () => {
    if (account.length < 10 || !bank) return
    setVerifying(true)
    window.setTimeout(() => {
      setVerifying(false)
      setVerified(true)
      if (!nickname) setNickname('John A · Contractor')
    }, 700)
  }

  const networks = useMemo(() => {
    const query = networkQuery.trim().toLowerCase()
    return NETWORKS.filter((item) => item.toLowerCase().includes(query))
  }, [networkQuery])

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          showCloseButton={false}
          overlayClassName="bg-black/55 backdrop-blur-md"
          className="gap-0 overflow-y-auto rounded-bl-[20px] border-0 bg-[#1c1c1c] p-5 data-[side=right]:bottom-auto data-[side=right]:h-auto data-[side=right]:max-h-dvh data-[side=right]:w-[540px] data-[side=right]:max-w-[calc(100vw-24px)] data-[side=right]:sm:max-w-[540px]"
        >
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold text-white">
              {mode === 'edit' ? 'Edit beneficiary' : 'Add beneficiary'}
            </SheetTitle>
            <SheetClose
              render={
                <button type="button" aria-label="Close" className="text-[#e8e8e8] outline-none" />
              }
            >
              <X className="size-5" />
            </SheetClose>
          </div>

          <FieldGroup className="mt-5 gap-4">
            <Field className="relative">
              <FieldLabel className="text-sm font-normal text-[#9a9a9a]">Currency</FieldLabel>
              <button
                type="button"
                onClick={() => setCurrencyOpen((value) => !value)}
                className="flex h-12 w-full items-center gap-2 rounded-[12px] bg-[#2a2a2a] px-3 text-left text-sm text-[#f5f5f5] outline-none"
              >
                {selected ? <CurrencyMark flag={selected.flag} /> : <span className="text-[#8d8d8d]">◎</span>}
                <span className={selected ? '' : 'text-[#8d8d8d]'}>
                  {selected?.name ?? 'Select a currency'}
                </span>
                <ChevronDown className="ml-auto size-4 text-[#bdbdbd]" />
              </button>
              <FieldDescription>Which currency does this beneficiary accept</FieldDescription>
              {currencyOpen ? (
                <div className="absolute top-[72px] z-10 w-full rounded-[12px] border border-[#333] bg-[#242424] p-1">
                  {CURRENCIES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setCurrency(item.id)
                        setCurrencyOpen(false)
                        setVerified(false)
                      }}
                      className="flex h-10 w-full items-center gap-2 rounded-[8px] px-2 text-sm outline-none hover:bg-[#333]"
                    >
                      <CurrencyMark flag={item.flag} />
                      {item.name}
                    </button>
                  ))}
                </div>
              ) : null}
            </Field>

            {rail === 'bank' ? (
              <>
                <Field className="relative">
                  <FieldLabel className="text-sm font-normal text-[#9a9a9a]">Bank</FieldLabel>
                  <button
                    type="button"
                    onClick={() => setBankOpen((value) => !value)}
                    className="flex h-12 w-full items-center gap-2 rounded-[12px] bg-[#2a2a2a] px-3 text-left text-sm outline-none"
                  >
                    <Landmark className="size-4 text-[#9a9a9a]" />
                    <span className={bank ? 'text-white' : 'text-[#8d8d8d]'}>
                      {bank || 'Select a bank'}
                    </span>
                    <ChevronDown className="ml-auto size-4 text-[#bdbdbd]" />
                  </button>
                  {bankOpen ? (
                    <div className="absolute top-[72px] z-10 w-full rounded-[12px] border border-[#333] bg-[#242424] p-1">
                      {BANKS.map((item) => (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => {
                            setBank(item.name)
                            setBankOpen(false)
                            setVerified(false)
                          }}
                          className="flex h-10 w-full items-center gap-2 rounded-[8px] px-2 text-sm outline-none hover:bg-[#333]"
                        >
                          <span className="size-4 rounded-full" style={{ backgroundColor: item.color }} />
                          {item.name}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </Field>
                <Field>
                  <FieldLabel className="text-sm font-normal text-[#9a9a9a]">Account number</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      value={account}
                      inputMode="numeric"
                      placeholder="Enter account number"
                      onChange={(event) => {
                        setAccount(event.target.value.replace(/\D/g, '').slice(0, 10))
                        setVerified(false)
                      }}
                      className="h-12 flex-1 rounded-[12px] border-0 bg-[#2a2a2a] px-4 text-white placeholder:text-[#8d8d8d]"
                    />
                    <button
                      type="button"
                      onClick={verify}
                      disabled={account.length < 10 || !bank || verifying}
                      className="h-12 min-w-[88px] rounded-[12px] bg-[#2a2a2a] px-4 text-sm text-[#f3f3f3] outline-none disabled:text-[#6d6d6d]"
                    >
                      {verifying ? <LoaderCircle className="mx-auto size-4 animate-spin" /> : verified ? '•••' : 'Verify'}
                    </button>
                  </div>
                </Field>
                {verified ? (
                  <div className="flex items-center gap-3 rounded-[14px] bg-[#14301f] px-3 py-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-[#1f7a45] text-xs font-semibold text-white">
                      JA
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#b6f3cd]">JOHN ADEYEMI</p>
                      <p className="text-[13px] text-[#9a9a9a]">
                        {bank} · {account}
                      </p>
                    </div>
                    <Check className="size-4 text-[#3ddc84]" />
                  </div>
                ) : null}
              </>
            ) : null}

            {rail === 'wallet' ? (
              <>
                <Field className="relative">
                  <FieldLabel className="text-sm font-normal text-[#9a9a9a]">Select network</FieldLabel>
                  <div className="flex h-12 items-center gap-2 rounded-[12px] bg-[#2a2a2a] px-3">
                    <Search className="size-4 text-[#8d8d8d]" />
                    <Input
                      value={network || networkQuery}
                      placeholder="Select or search for network"
                      onFocus={() => setNetworkOpen(true)}
                      onChange={(event) => {
                        setNetwork('')
                        setNetworkQuery(event.target.value)
                        setNetworkOpen(true)
                      }}
                      className="h-full border-0 bg-transparent px-0 text-white shadow-none placeholder:text-[#8d8d8d] focus-visible:ring-0"
                    />
                    <ChevronDown className="size-4 text-[#bdbdbd]" />
                  </div>
                  {networkOpen ? (
                    <div className="absolute top-[72px] z-10 w-full rounded-[12px] border border-[#333] bg-[#242424] p-1">
                      {networks.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setNetwork(item)
                            setNetworkQuery('')
                            setNetworkOpen(false)
                          }}
                          className="flex h-10 w-full items-center rounded-[8px] px-2 text-left text-sm outline-none hover:bg-[#333]"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </Field>
                <Field>
                  <FieldLabel className="text-sm font-normal text-[#9a9a9a]">Address</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      value={address}
                      placeholder="Enter wallet address"
                      onChange={(event) => setAddress(event.target.value)}
                      className="h-12 flex-1 rounded-[12px] border-0 bg-[#2a2a2a] px-4 text-white placeholder:text-[#8d8d8d]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.readText().then((text) => setAddress(text)).catch(() => {})
                      }}
                      className="flex h-12 items-center gap-1 rounded-[12px] bg-[#2a2a2a] px-4 text-sm text-[#f3f3f3] outline-none"
                    >
                      <ClipboardPaste className="size-4" />
                      Paste
                    </button>
                  </div>
                </Field>
                {address.trim() ? (
                  <Alert className="border-0 bg-[#3a3014] text-[#f3d48a]">
                    <ShieldAlert />
                    <AlertTitle>Cross check address</AlertTitle>
                    <AlertDescription className="text-[#e6d7a4]">
                      Please cross check the wallet address to make sure it&apos;s correct.
                    </AlertDescription>
                  </Alert>
                ) : null}
              </>
            ) : null}

            {selected ? (
              <Field>
                <FieldLabel htmlFor="nickname" className="text-sm font-normal text-[#9a9a9a]">
                  Save as (nickname)
                </FieldLabel>
                <Input
                  id="nickname"
                  value={nickname}
                  placeholder="Enter a name"
                  onChange={(event) => setNickname(event.target.value)}
                  className="h-12 rounded-[12px] border-0 bg-[#2a2a2a] px-4 text-white placeholder:text-[#8d8d8d]"
                />
              </Field>
            ) : null}
          </FieldGroup>

          <Separator className="my-5 bg-[#2e2e2e]" />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetAndClose}
              className="h-12 flex-1 rounded-[12px] bg-[#2e2e2e] text-sm font-medium text-white outline-none hover:bg-[#3a3a3a]"
            >
              Cancel
            </button>
            <PrimaryButton type="button" className="flex-1" disabled={!canSave} onClick={save}>
              {mode === 'edit' ? 'Save changes' : 'Save beneficiary'}
            </PrimaryButton>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={savedOpen} onOpenChange={setSavedOpen}>
        <DialogContent
          overlayClassName="bg-black/60 backdrop-blur-md"
          className="w-[440px] rounded-[22px] bg-[#2a2a2a] p-6 text-center ring-0 sm:max-w-[440px]"
        >
          <SuccessCloud />
          <DialogTitle className="text-xl text-white">Beneficiary saved</DialogTitle>
          <DialogDescription>
            <span className="text-white">{nickname || 'Beneficiary'}</span> has been saved successfully
          </DialogDescription>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setSavedOpen(false)
                onOpenChange(false)
              }}
              className="h-12 flex-1 rounded-[12px] bg-[#3a3a3a] text-sm font-medium text-white outline-none"
            >
              View beneficiary
            </button>
            <PrimaryButton
              type="button"
              className="flex-1"
              onClick={() => navigate({ to: '/dashboard' })}
            >
              Go to dashboard
            </PrimaryButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function CurrencyMark({ flag }: { flag: string }) {
  if (flag === 'usdc') return <UsdcMark />
  return <Flag code={flag} className="size-5" />
}

function shorten(value: string) {
  if (value.length < 12) return value
  return `${value.slice(0, 6)}…${value.slice(-4)}`
}
