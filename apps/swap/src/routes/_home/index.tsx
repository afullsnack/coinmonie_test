import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Copy, QrCode } from 'lucide-react'
import { TokenSelectorModal } from '@/components/token-selector-modal'
import { BankSelectorModal } from '@/components/bank-selector-modal'
import { Button } from '#/components/ui/button'
import { MiddleToggle } from '#/components/MiddleToggle'

import type { Asset, Bank, Network } from '#/data/constants'
import { offrampRateMutationOptions, type Coin } from '#/lib/api-client'
import SendComponent from './-components/SendAsset'
import ReceiveComponent from './-components/ReceiveAsset'
import FiatDestination from './-components/FiatDestination'
import { useMutation } from '@tanstack/react-query'

export const Route = createFileRoute('/_home/')({ component: Home })


const BASE_ASSET = 'NGN'
const BASE_ASSET_RATE_USD = 1386

function Home() {
  const [sendToken, setSendToken] = useState<Asset | null>(null)
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null)
  const [receiveCurrency, setReceiveCurrency] = useState<{
    id: string
    symbol: string
    name: string
    rate: number
  } | null>(null)
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null)
  const [sendAmount, setSendAmount] = useState('')
  const [receiveAmount, setReceiveAmount] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false)
  const [isBankModalOpen, setIsBankModalOpen] = useState(false)
  const [isFindingQuote, setIsFindingQuote] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
	const [isLoading, setLoading] = useState<boolean>(false)
	const rate = useMutation(offrampRateMutationOptions)

	useEffect(() => {
		rate.mutate({asset: "base:usdc"})
	}, [])

  const handleSendAmountChange = (value: string) => {
    setSendAmount(value)
    if (value && !Number.isNaN(Number.parseFloat(value))) {
      const amount = Number.parseFloat(value)
      const received = (1) * amount * (rate.data?.rate ?? 1)
      setReceiveAmount(
        received.toLocaleString('en-US', {
          maximumFractionDigits: 2,
        }),
      )
    } else {
      setReceiveAmount('')
    }
  }

  const handleSwap = async () => {
    setLoading(true)
    if (!sendAmount || !selectedBank || !accountNumber) return
    await new Promise((r, _) =>
      setTimeout(() => {
        setLoading(false)
        setAddress('0x'.padEnd(32, '0'))
      }, 3_000),
    )
    // setIsFindingQuote(true)
    // setTimeout(() => {
    //   setIsFindingQuote(false)
    // }, 2000)
  }

  console.log(`Address`, { address })

  return (
    <>
      <div className="w-full max-w-full px-4">
        <div className="grid gap-2 rounded-2xl p-2 shadow-2xl overflow-hidden bg-primary-foreground/5 mb-3">
          <div className="relative grid gap-1">
            <SendComponent
              handleSendAmountChange={handleSendAmountChange}
              sendAmount={sendAmount}
              setIsTokenModalOpen={setIsTokenModalOpen}
              sendToken={sendToken}
            />
            <MiddleToggle />
            <ReceiveComponent
              handleSendAmountChange={handleSendAmountChange}
              sendAmount={sendAmount}
              receiveAmount={receiveAmount}
              setIsTokenModalOpen={setIsTokenModalOpen}
              receiveCurrency={receiveCurrency}
            />
          </div>

          <FiatDestination
            setIsBankModalOpen={setIsBankModalOpen}
            selectedbank={selectedBank}
            accountNumber={accountNumber}
            onAccountNumberChange={setAccountNumber}
          />
        </div>

        {!address && (
          <Button
            onClick={handleSwap}
            size="lg"
            variant="secondary"
            disabled={
              !sendAmount || !selectedBank || !accountNumber || isLoading
            }
            className="w-full max-h-18 h-full bg-accent text-secondary font-semibold rounded-xl py-4 flex items-center justify-center gap-2"
          >
            Choose asset to send
          </Button>
        )}
        {address && (
          <div className="bg-primary text-secondary rounded-xl p-4 border border-secondary/20 flex items-center justify-between">
            <div className="">
              <h3 className="m-0! text-secondary text-sm font-semibold">
                Transfer {sendAmount}
                {sendToken?.code.toUpperCase()} to
              </h3>
              <span className="text-xs">{address}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="default"
                size="icon-xs"
                className="bg-accent rounded-full"
                onClick={() => navigator.clipboard.writeText(address)}
              >
                <Copy />
              </Button>
              <Button
                variant="default"
                size="icon-xs"
                className="bg-accent rounded-full"
              >
                <QrCode />
              </Button>
            </div>
          </div>
        )}
      </div>

      <TokenSelectorModal
        open={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
				onSelect={setSendToken}
        onNetworkSelect={setSelectedNetwork}
				sendToken={sendToken}
				selectedNetwork={selectedNetwork}
      />

      <BankSelectorModal
        open={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        onSelect={setSelectedBank}
        selectedBank={selectedBank}
      />
    </>
  )
}
