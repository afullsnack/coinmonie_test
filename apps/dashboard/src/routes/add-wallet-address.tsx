import { requireSession } from '#/lib/session'
import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { TriangleAlert } from 'lucide-react'

import { PrimaryButton } from '#/components/auth/primary-button'
import { ClockMark, FailMark, FlowFrame, SuccessCloud, UsdcMark } from '#/components/money/chrome'
import { SearchSelect } from '#/components/money/search-select'
import type { SearchOption } from '#/components/money/search-select'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '#/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Separator } from '#/components/ui/separator'

export const Route = createFileRoute('/add-wallet-address')({
  beforeLoad: requireSession,
  head: () => ({ meta: [{ title: 'Add wallet address · CoinMonie' }] }),
  component: AddWalletAddressPage,
})

const STABLECOINS: SearchOption[] = [
  {
    value: 'USDT',
    label: 'USDT',
    icon: (
      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#26a17b] text-[9px] font-bold text-white">
        T
      </span>
    ),
  },
  { value: 'USDC', label: 'USDC', icon: <UsdcMark className="size-4 text-[8px]" /> },
]

const NETWORKS: SearchOption[] = [
  { value: 'TRON', label: 'TRON', hint: 'TRC20', icon: <NetworkDot color="#e5484d" /> },
  { value: 'Ethereum', label: 'Ethereum', hint: 'ERC20', icon: <NetworkDot color="#9a9a9a" /> },
  { value: 'Solana', label: 'Solana', hint: 'SOL', icon: <NetworkDot color="#9b5cf6" /> },
]

const ADDRESS_FORMAT: Record<string, RegExp> = {
  TRON: /^T[1-9A-HJ-NP-Za-km-z]{25,40}$/,
  Ethereum: /^0x[0-9a-fA-F]{40}$/,
  Solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
}

type Phase = 'form' | 'saving' | 'success' | 'failed'

function AddWalletAddressPage() {
  const router = useRouter()
  const navigate = useNavigate()
  const [coin, setCoin] = useState<string | null>(null)
  const [network, setNetwork] = useState<string | null>(null)
  const [address, setAddress] = useState('')
  const [phase, setPhase] = useState<Phase>('form')

  const ready = Boolean(coin && network && address.trim())

  useEffect(() => {
    if (phase !== 'saving' || !network) return
    const timer = window.setTimeout(() => {
      setPhase(ADDRESS_FORMAT[network].test(address.trim()) ? 'success' : 'failed')
    }, 1400)
    return () => window.clearTimeout(timer)
  }, [address, network, phase])

  return (
    <FlowFrame onBack={() => router.history.back()}>
      <div className="mx-auto mt-16 w-full max-w-[440px]">
        <h1 className="text-[22px] font-semibold tracking-[-0.01em] text-white">Add wallet address</h1>
        <p className="mt-1 text-sm text-[#9a9a9a]">
          Add your wallet address to receive money from CoinMonie.
        </p>
        <Separator className="my-5 bg-[#262626]" />
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="stablecoin" className="text-sm font-normal text-[#9a9a9a]">
              Select stablecoin
            </FieldLabel>
            <SearchSelect
              id="stablecoin"
              value={coin}
              options={STABLECOINS}
              placeholder="Select or search for stablecoin"
              onChange={setCoin}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="network" className="text-sm font-normal text-[#9a9a9a]">
              Select network
            </FieldLabel>
            <SearchSelect
              id="network"
              value={network}
              options={NETWORKS}
              placeholder="Select or search for network"
              onChange={setNetwork}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="address" className="text-sm font-normal text-[#9a9a9a]">
              Address
            </FieldLabel>
            <Input
              id="address"
              value={address}
              placeholder="Enter wallet address"
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => setAddress(event.target.value.trim())}
              className="h-12 rounded-[14px] border-0 bg-[#2a2a2a] px-3 text-sm text-white placeholder:text-[#8d8d8d] dark:bg-[#2a2a2a]"
            />
          </Field>
          {address ? (
            <Alert className="rounded-[14px] border-0 bg-[#262626] px-3 py-3 text-[#f0f0f0]">
              <TriangleAlert className="fill-[#f0c14b] text-[#262626]!" />
              <AlertTitle className="font-medium">Cross check address</AlertTitle>
              <AlertDescription className="text-xs text-[#8d8d8d]">
                Please cross check the wallet address to make sure it&apos;s correct.
              </AlertDescription>
            </Alert>
          ) : null}
        </FieldGroup>
        <Separator className="my-5 bg-[#262626]" />
        <PrimaryButton type="button" disabled={!ready} onClick={() => setPhase('saving')}>
          Save wallet address
        </PrimaryButton>
      </div>

      {phase === 'saving' ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 backdrop-blur-md">
          <div className="flex flex-col items-center gap-2 text-center">
            <ClockMark />
            <p className="text-xl font-semibold text-white">Saving wallet address</p>
            <p className="text-sm text-[#bdbdbd]">This usually takes less than 30 seconds.</p>
            <span className="mt-6 flex items-center gap-3">
              <span className="size-1.5 rounded-full bg-white/60" />
              <span className="size-4 rounded-full bg-white" />
              <span className="size-1.5 rounded-full bg-white/60" />
            </span>
          </div>
        </div>
      ) : null}

      <Dialog open={phase === 'success'} onOpenChange={() => navigate({ to: '/dashboard' })}>
        <DialogContent
          overlayClassName="bg-black/60 backdrop-blur-md"
          className="w-[400px] gap-3 rounded-[22px] bg-[#1c1c1c] p-4 pt-12 text-center ring-0 sm:max-w-[400px]"
        >
          <SuccessCloud />
          <DialogTitle className="text-lg font-semibold text-white">Wallet address saved</DialogTitle>
          <DialogDescription className="text-[#8d8d8d]">
            Your wallet address is now ready to receive payouts.
          </DialogDescription>
          <PrimaryButton type="button" className="mt-2" onClick={() => navigate({ to: '/dashboard' })}>
            Go to dashboard
          </PrimaryButton>
        </DialogContent>
      </Dialog>

      <Dialog open={phase === 'failed'} onOpenChange={(open) => !open && setPhase('form')}>
        <DialogContent
          overlayClassName="bg-black/60 backdrop-blur-md"
          className="w-[400px] gap-3 rounded-[22px] bg-[#1c1c1c] p-4 pt-12 text-center ring-0 sm:max-w-[400px]"
        >
          <FailMark />
          <DialogTitle className="text-lg font-semibold text-white">
            We couldn&apos;t verify add address
          </DialogTitle>
          <DialogDescription className="text-[#8d8d8d]">
            We couldn&apos;t add your wallet address, try again.
          </DialogDescription>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setPhase('form')}
              className="h-12 flex-1 rounded-[12px] bg-[#2a2a2a] text-sm font-medium text-white outline-none hover:bg-[#333]"
            >
              Back
            </button>
            <PrimaryButton type="button" className="flex-1" onClick={() => setPhase('saving')}>
              Try again
            </PrimaryButton>
          </div>
        </DialogContent>
      </Dialog>
    </FlowFrame>
  )
}

function NetworkDot({ color }: { color: string }) {
  return (
    <span className="flex size-4 shrink-0 items-center justify-center">
      <span className="size-2.5 rotate-45 rounded-[2px]" style={{ backgroundColor: color }} />
    </span>
  )
}
