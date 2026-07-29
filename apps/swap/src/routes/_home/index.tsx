import { useEffect, useState } from 'react'
import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { Copy, Loader2, QrCode } from 'lucide-react'
import { TokenSelectorModal } from '@/components/token-selector-modal'
import { BankSelectorModal } from '@/components/bank-selector-modal'
import { Button } from '#/components/ui/button'
import { MiddleToggle } from '#/components/MiddleToggle'

import { LOCAL } from '#/data/constants'
import type { Asset, Bank, Fiat, Network } from '#/data/constants'
import {
  bankLookUpMutationOptions,
  initiateOfframpMutationOptions,
  offrampQuoteMutationOptions,
  offrampRateMutationOptions,
} from '#/lib/api-client'
import SendComponent from './-components/SendAsset'
import ReceiveComponent from './-components/ReceiveAsset'
import FiatDestination from './-components/FiatDestination'
import { useMutation } from '@tanstack/react-query'
import CopyButton from '#/components/ui/copy-button'
import { FiatSelectorModal } from '#/components/fiat-selector-modal'

export const Route = createFileRoute('/_home/')({ component: Home })

const BASE_ASSET = 'NGN'
const BASE_ASSET_RATE_USD = 1386

function Home() {
  const queryClient = useRouteContext({
    from: '/_home/',
    select: (c) => c.queryClient,
  })
  const [sendToken, setSendToken] = useState<Asset | null>(null)
  const [fiat, setFiat] = useState<Fiat>(LOCAL[0])
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
  const [isFiatModalOpen, setIsFiatModalOpen] = useState(false)
  const [isBankModalOpen, setIsBankModalOpen] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const rate = useMutation(offrampRateMutationOptions)
  const quote = useMutation(offrampQuoteMutationOptions)
  const initiate = useMutation({
    ...initiateOfframpMutationOptions,
    onSuccess(data) {
      setAddress(data.deposit.address)
    },
  })
  const bankLookup = useMutation(bankLookUpMutationOptions)

  useEffect(() => {
    if (
      selectedBank &&
      accountNumber &&
      accountNumber.length >= fiat.mobileLength
    ) {
      if (fiat.country === 'NG') {
        bankLookup.mutate({
          bankCode: selectedBank.code || '',
          accountNumber: accountNumber,
          country: fiat.country,
        })
      } else {
        bankLookup.mutate({
          phoneNumber: accountNumber,
          country: fiat.country,
          mobileNetwork: selectedBank.code,
        })
      }
    }
  }, [accountNumber, selectedBank])

  useEffect(() => {
    if (sendToken) {
      rate.mutate({
        asset: sendToken.id,
        country: fiat.country,
        currency: fiat.currency,
      })
    }
    setAccountNumber('')
    setSelectedBank(null)
    bankLookup.reset()
    queryClient.invalidateQueries({ queryKey: ['bankList'] })
  }, [sendToken, fiat])

  const handleSendAmountChange = (value: string) => {
    setSendAmount(value)
    if (value && !Number.isNaN(Number.parseFloat(value))) {
      const amount = Number.parseFloat(value)
      const received = amount * (rate.data?.rate ?? 1)
      setReceiveAmount(
        received.toLocaleString('en-US', {
          maximumFractionDigits: 2,
        }),
      )
    } else {
      setReceiveAmount('')
    }
  }

  useEffect(() => {
    if (rate.data && sendToken) {
      if (sendAmount && !Number.isNaN(Number.parseFloat(sendAmount))) {
        const amount = Number.parseFloat(sendAmount)
        const received = amount * (rate.data.rate)
        setReceiveAmount(
          received.toLocaleString('en-US', {
            maximumFractionDigits: 2,
          }),
        )
      } else {
        setReceiveAmount('')
      }
    }
  }, [rate.data, rate, sendAmount, receiveAmount, sendToken])

  const handleSwap = async () => {
    if (!sendAmount || !selectedBank || !accountNumber || !bankLookup.data)
      return
    const amount = Number.parseFloat(sendAmount)
    const receivingAmount = amount * (rate.data?.rate ?? 1)
    console.log(
      `Amounts, send, receive, fiat, bank`,
      sendAmount,
      amount,
      receivingAmount,
      receiveAmount,
      fiat,
      selectedBank,
    )

    if (fiat.country === 'NG') {
      initiate.mutate({
        asset: sendToken?.id || '',
        amount: Math.round(amount),
        bankCode: bankLookup.data.bank_code,
        accountName: bankLookup.data.account_name,
        accountNumber: bankLookup.data.account_number,
        country: fiat.country,
        currency: fiat.currency,
      })
    } else {
      initiate.mutate({
        asset: sendToken?.id || '',
        amount: Math.round(amount),
        accountName: bankLookup.data.account_name,
        mobileNetwork: bankLookup.data.mobile_network,
        mobileNumber: bankLookup.data.phone_number,
        country: fiat.country,
        currency: fiat.currency,
      })
    }
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
              rate={rate.data?.rate}
            />
            <MiddleToggle />
            <ReceiveComponent
              handleSendAmountChange={handleSendAmountChange}
              sendAmount={sendAmount}
              receiveAmount={receiveAmount}
              setIsFiatModalOpen={setIsFiatModalOpen}
              fiat={fiat}
              rate={rate.data?.rate}
            />
          </div>

          <FiatDestination
            setIsBankModalOpen={setIsBankModalOpen}
            selectedbank={selectedBank}
            accountNumber={accountNumber}
            onAccountNumberChange={setAccountNumber}
            accountName={bankLookup.data?.account_name}
            isFetching={bankLookup.isPending}
            fiat={fiat}
          />
        </div>

        {!address && (
          <Button
            onClick={handleSwap}
            size="lg"
            disabled={
              !sendAmount ||
              !selectedBank ||
              !accountNumber ||
              initiate.isPending
            }
            className="w-full max-h-18 h-full bg-accent text-secondary font-semibold rounded-xl py-4 flex items-center justify-center gap-2"
          >
            {!sendToken
              ? 'Choose asset to send'
              : !accountNumber
                ? 'Enter account number'
                : ''}
            {accountNumber &&
              sendToken &&
              !initiate.isPending &&
              'Create transfer'}
            {accountNumber && sendToken && initiate.isPending && (
              <>
                <Loader2 className="animate-spin" />
                <span>Creating transfer...</span>
              </>
            )}
          </Button>
        )}
        {address && (
          <div className="bg-secondary text-primary rounded-xl p-4 border border-primary/20 flex items-center justify-between shadow-sm">
            <div className="">
              <h3 className="m-0! text-primary text-sm font-semibold">
                Transfer {sendAmount} {sendToken?.code.toUpperCase()} to
              </h3>
              <span className="text-xs line-clamp-1 text-ellipsis max-w-3xs">
                {address}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <CopyButton
                content={address}
                className="bg-accent rounded-full"
                size="icon-sm"
              />
              <Button
                variant="default"
                size="icon-sm"
                className="bg-accent rounded-full"
              >
                <QrCode />
              </Button>
            </div>
          </div>
        )}
        {quote.data && (
          <div className="flex items-center justify-between">
            <span>
              Swap {sendAmount} {sendToken?.code.toUpperCase()} to{' '}
              {receiveAmount} {receiveCurrency?.symbol}
            </span>
            <span>
              Estimated time: <b>1 minute, 30 seconds</b>
            </span>
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

      <FiatSelectorModal
        onClose={() => setIsFiatModalOpen(false)}
        open={isFiatModalOpen}
        onFiatSelect={setFiat}
        selectedFiat={fiat}
      />

      <BankSelectorModal
        open={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        onSelect={setSelectedBank}
        selectedBank={selectedBank}
        fiat={fiat}
      />
    </>
  )
}
