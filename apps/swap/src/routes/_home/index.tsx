import { useEffect, useRef, useState } from 'react'
import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { CheckCircle2, Copy, ExternalLink, Loader2, QrCode } from 'lucide-react'
import { TokenSelectorModal } from '@/components/token-selector-modal'
import { BankSelectorModal } from '@/components/bank-selector-modal'
import { Button } from '#/components/ui/button'
import { MiddleToggle } from '#/components/MiddleToggle'

import type {Asset, Bank, Fiat, Network} from "#/data/constants"
import { assetListQueryOptions, bankLookUpMutationOptions, coverageQueryOptions, enabledCurrenciesQueryOptions, errorMessage, initiateOfframpMutationOptions, offrampQuoteMutationOptions, offrampRateMutationOptions, transactionLimitConfigQueryOptions, transactionStatusQueryOptions } from '#/lib/api-client'
import { addMyDepositAddress } from '#/lib/my-transactions'
import { getExplorerUrl } from '#/lib/explorer'
import SendComponent from './-components/SendAsset'
import ReceiveComponent from './-components/ReceiveAsset'
import FiatDestination from './-components/FiatDestination'
import { QrCodeModal } from '#/components/qrcode-address-modal'
import WaitlistSignup from './-components/WaitlistSignup'
import { useMutation, useQuery } from '@tanstack/react-query'
import { FiatSelectorModal } from '#/components/fiat-selector-modal'
import { toast } from 'sonner'
import { dismissErrorDialog, showErrorDialog } from '#/lib/error-dialog-store'

export const Route = createFileRoute('/_home/')({ component: Home })

function statusColorClass(status: string | undefined): string {
	if (status === 'FAILED') return 'text-destructive'
	if (status === 'COMPLETED') return 'text-green-600 dark:text-green-400'
	if (status === 'AWAITING_DEPOSIT' || status === 'PENDING' || status === 'PROCESSING')
		return 'text-amber-600 dark:text-amber-400'
	return 'text-muted-foreground'
}

function Home() {
  const queryClient = useRouteContext({
    from: '/_home/',
    select: (c) => c.queryClient,
  })
  const [sendToken, setSendToken] = useState<Asset | null>(null)
  const currencies = useQuery(enabledCurrenciesQueryOptions)
  const assets = useQuery(assetListQueryOptions)
  const coverage = useQuery(coverageQueryOptions)
  const transactionLimit = useQuery(transactionLimitConfigQueryOptions)
  const [fiat, setFiat] = useState<Fiat | null>(null)
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null)
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null)
  const [sendAmount, setSendAmount] = useState('')
  const [receiveAmount, setReceiveAmount] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false)
  const [isFiatModalOpen, setIsFiatModalOpen] = useState(false)
  const [isBankModalOpen, setIsBankModalOpen] = useState(false)
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [reference, setReference] = useState<string | null>(null)
	const [providerAmountError, setProviderAmountError] = useState<string | null>(null)
	const rate = useMutation({
		...offrampRateMutationOptions,
		onError(error) {
			setProviderAmountError(errorMessage(error, 'Please try again in a moment.'))
			showErrorDialog(errorMessage(error, 'Please try again in a moment.'))
		},
	})
	const quote = useMutation({
		...offrampQuoteMutationOptions,
		onError(error) {
			setProviderAmountError(errorMessage(error, 'Please try again in a moment.'))
			showErrorDialog(errorMessage(error, 'Please try again in a moment.'))
		},
	})
	const initiate = useMutation({
		...initiateOfframpMutationOptions,
		onSuccess(data) {
			setAddress(data.deposit.address)
			setReference(data.reference)
			addMyDepositAddress(data.deposit.address)
		},
	})
	const bankLookup = useMutation(bankLookUpMutationOptions)
	const transactionStatus = useQuery(transactionStatusQueryOptions(reference))
	const isCompleted = transactionStatus.data?.status === 'COMPLETED'

	useEffect(() => {
		if (!fiat && currencies.data.length > 0) {
			setFiat(currencies.data[0])
		}
	}, [currencies.data, fiat])

	useEffect(() => {
		if (!selectedNetwork && assets.data.length > 0) {
			const bscNames = ['bsc', 'bnb chain', 'binance smart chain', 'bnb']
			const bscAsset = assets.data.find((asset) => bscNames.includes(asset.blockchain.name.toLowerCase()))
			if (bscAsset) {
				setSelectedNetwork({ ...bscAsset.blockchain, type: bscAsset.blockchain.type ?? '' })
			}
		}
	}, [assets.data, selectedNetwork])

	useEffect(() => {
		if (fiat && selectedBank && accountNumber && accountNumber.length >= fiat.mobileLength) {
			if (fiat.country === "NG") {
				bankLookup.mutate({
					bankCode: selectedBank.code || '',
					accountNumber: accountNumber,
					country: fiat.country,
				})
			} else {
				bankLookup.mutate({
					phoneNumber: accountNumber,
					country: fiat.country,
					mobileNetwork: selectedBank.code
				})
			}
		}
	}, [accountNumber, selectedBank])

	useEffect(() => {
		if (sendToken && fiat) {
			rate.mutate({
				asset: sendToken.id,
				country: fiat.country,
				currency: fiat.currency
			})
		}
		setAccountNumber('')
		setSelectedBank(null)
		bankLookup.reset()
		queryClient.invalidateQueries({queryKey: ['bankList']})
	}, [sendToken, fiat])

  const handleSendAmountChange = (value: string) => {
    setSendAmount(value)
    setProviderAmountError(null)
  }

	useEffect(() => {
		setProviderAmountError(null)
	}, [sendToken, fiat])

	const channel = fiat?.country === 'NG' ? 'BANK' : 'MOBILEMONEY'
	const payoutLimit = fiat ? coverage.data[fiat.country]?.[channel] : undefined
	const parsedSendAmount = Number.parseFloat(sendAmount)
	const amountUsd = quote.data?.source.amount_usd ?? (Number.isNaN(parsedSendAmount) ? undefined : parsedSendAmount)
	const isCappedAsset = Boolean(sendToken) && ['USDT', 'USDC'].some((s) => sendToken!.code.toUpperCase().includes(s))
	const transactionCap = transactionLimit.data?.enabled ? transactionLimit.data.limitUsd : undefined
	const exceedsTransactionCap =
		isCappedAsset && !Number.isNaN(parsedSendAmount) && typeof transactionCap === 'number' && parsedSendAmount > transactionCap
	const amountError = exceedsTransactionCap
		? `Max. amount is $${transactionCap!.toLocaleString('en-US')}`
		: payoutLimit && typeof amountUsd === 'number'
			? amountUsd < payoutLimit.min * 1.005
				? `Min. amount is $${payoutLimit.min.toLocaleString('en-US')}`
				: amountUsd > payoutLimit.max
					? `Max. amount is $${payoutLimit.max.toLocaleString('en-US')}`
					: null
			: (() => {
					if (!providerAmountError) return null
					const match = providerAmountError.match(/^(Minimum|Maximum) amount.*?([\d,.]+)/i)
					if (!match) return providerAmountError
					const label = match[1].toLowerCase() === 'minimum' ? 'Min.' : 'Max.'
					return `${label} amount is $${match[2]}`
				})()

	const capDialogShownRef = useRef(false)
	useEffect(() => {
		if (exceedsTransactionCap && typeof transactionCap === 'number') {
			showErrorDialog(`Maximum amount per transaction is $${transactionCap.toLocaleString('en-US')}`)
			capDialogShownRef.current = true
		} else if (capDialogShownRef.current) {
			dismissErrorDialog()
			capDialogShownRef.current = false
		}
	}, [exceedsTransactionCap, transactionCap])

	useEffect(() => {
		if (sendAmount && !Number.isNaN(Number.parseFloat(sendAmount)) && rate.data?.rate && !amountError) {
			const amount = Number.parseFloat(sendAmount)
			const received = amount * rate.data.rate
			setReceiveAmount(
				received.toLocaleString('en-US', {
					maximumFractionDigits: 2,
				}),
			)
		} else {
			setReceiveAmount('')
		}
	}, [sendAmount, rate.data?.rate, amountError])

	useEffect(() => {
		if (!sendAmount || !sendToken || !fiat || Number.isNaN(Number.parseFloat(sendAmount)) || amountError) return
		const timeout = setTimeout(() => {
			quote.mutate({
				asset: sendToken.id,
				amount: Number.parseFloat(sendAmount),
				country: fiat.country,
				currency: fiat.currency,
			})
		}, 600)
		return () => clearTimeout(timeout)
	}, [sendAmount, sendToken, fiat, amountError])

  const handleSwap = async () => {
		if (!sendAmount || !selectedBank || !accountNumber || !bankLookup.data || !fiat || !rate.data?.rate || amountError) return
		const amount = Number.parseFloat(sendAmount)

		if (fiat.country === "NG") {
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

  return (
    <>
      <div className="w-full max-w-full px-4">
        <div className="mb-5 text-center">
          <h1 className="text-2xl font-semibold text-foreground flex flex-wrap items-center justify-center gap-x-2">
            {['Pay', 'anyone,', 'anywhere.'].map((word, i) => (
              <motion.span
                key={word}
                initial={{ y: -40, x: (i - 1) * 24, rotate: (i - 1) * 18 - 10, opacity: 0 }}
                animate={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 120, damping: 14, mass: 1.1, delay: i * 0.15 }}
                className="inline-block"
              >
                {word}
              </motion.span>
            ))}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            With your stablecoin, you can payout any local currency in seconds. No sign up, non-custodial.
          </p>
        </div>

        <div className="grid gap-2 rounded-xl p-2 border border-border overflow-hidden bg-card mb-3">
          <div className="relative grid gap-1">
            <SendComponent
              handleSendAmountChange={handleSendAmountChange}
              sendAmount={sendAmount}
              setIsTokenModalOpen={setIsTokenModalOpen}
							sendToken={sendToken}
              usdValue={quote.data?.source.amount_usd}
              isUsdLoading={quote.isPending}
              fiat={fiat}
              rate={rate.data?.rate}
              amountError={amountError}
            />
            <MiddleToggle />
            <ReceiveComponent
              handleSendAmountChange={handleSendAmountChange}
              sendAmount={sendAmount}
              receiveAmount={receiveAmount}
              setIsFiatModalOpen={setIsFiatModalOpen}
              fiat={fiat}
              rate={rate.data?.rate}
              isRateLoading={rate.isPending}
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
            disabled={Boolean(amountError)}
          />
        </div>

        {!address && (
          <Button
            onClick={handleSwap}
            size="lg"
            disabled={
              !sendAmount || !selectedBank || !accountNumber || initiate.isPending || Boolean(amountError)
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
        {address && isCompleted && (
          <div className="bg-secondary text-primary rounded-xl p-5 border border-border">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent shrink-0">
                <CheckCircle2 className="size-5" />
              </div>
              <div className="min-w-0">
                <h3 className="m-0! text-primary text-lg font-bold">Transfer successful</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {sendAmount} {sendToken?.code.toUpperCase()} delivered
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex items-center justify-between gap-2 rounded-xl bg-primary-foreground/5 px-4 py-3">
                <span className="text-xs text-muted-foreground">Reference</span>
                <span className="font-mono text-xs truncate">{reference}</span>
              </div>
              {transactionStatus.data?.transactionHash && (
                <div className="flex items-center gap-2 rounded-xl bg-primary-foreground/5 px-4 py-3">
                  <span className="text-xs text-muted-foreground shrink-0">Tx hash</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(transactionStatus.data!.transactionHash!)
                      toast.success('Transaction hash copied')
                    }}
                    className="font-mono text-xs truncate flex-1 text-left hover:text-accent transition-colors"
                  >
                    {transactionStatus.data.transactionHash}
                  </button>
                  <Copy
                    className="size-3.5 text-muted-foreground shrink-0 cursor-pointer hover:text-accent transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText(transactionStatus.data!.transactionHash!)
                      toast.success('Transaction hash copied')
                    }}
                  />
                  {getExplorerUrl(transactionStatus.data.asset, transactionStatus.data.transactionHash) && (
                    <a
                      href={getExplorerUrl(transactionStatus.data.asset, transactionStatus.data.transactionHash)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-accent transition-colors shrink-0"
                      aria-label="View on block explorer"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </div>
              )}
            </div>

            <Button
              className="mt-4 w-full rounded-xl bg-accent text-accent-foreground"
              onClick={() => {
                const hash = transactionStatus.data?.transactionHash
                const summary = [
                  `Coinmonie transfer receipt`,
                  `${sendAmount} ${sendToken?.code.toUpperCase()} → completed`,
                  `Reference: ${reference}`,
                  hash ? `Tx hash: ${hash}` : null,
                ].filter(Boolean).join('\n')

                if (navigator.share) {
                  navigator.share({ title: 'Coinmonie receipt', text: summary }).catch(() => {})
                } else {
                  navigator.clipboard.writeText(summary)
                  toast.success('Receipt copied')
                }
              }}
            >
              Share receipt
            </Button>
          </div>
        )}

        {address && !isCompleted && (
          <div className="bg-secondary text-primary rounded-xl p-5 border border-border">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">
                  Send exactly
                </p>
                <h3 className="m-0! text-primary text-xl font-bold">
                  {sendAmount} {sendToken?.code.toUpperCase()}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  to the address below
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="default"
                  size="icon-sm"
                  className="bg-accent rounded-xl"
                  onClick={() => setIsQrModalOpen(true)}
                  aria-label="Show QR code"
                >
                  <QrCode />
                </Button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(address)
                toast.success('Address copied')
              }}
              className="mt-4 w-full flex items-center justify-between gap-2 rounded-xl bg-primary-foreground/5 px-4 py-3 text-left hover:bg-primary-foreground/10 transition-colors"
            >
              <span className="font-mono text-sm truncate">{address}</span>
              <Copy className="size-4 text-muted-foreground shrink-0" />
            </button>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs text-muted-foreground">
              {reference && (
                <span className="min-w-0 truncate">Reference: <span className="font-mono">{reference}</span></span>
              )}
              {quote.data?.settlement && (
                <span className="shrink-0">Settles in {quote.data.settlement} after deposit</span>
              )}
            </div>

            <div className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${statusColorClass(transactionStatus.data?.status)}`}>
              <Loader2 className="size-3 animate-spin" />
              <span>
                {transactionStatus.data?.status
                  ? `Status: ${transactionStatus.data.status.replaceAll('_', ' ')}`
                  : 'Waiting for deposit...'}
              </span>
            </div>
          </div>
				)}

        <WaitlistSignup />
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

			{fiat && (
        <BankSelectorModal
          open={isBankModalOpen}
          onClose={() => setIsBankModalOpen(false)}
          onSelect={setSelectedBank}
					selectedBank={selectedBank}
          fiat={fiat}
        />
      )}

      {address && (
        <QrCodeModal
          open={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          address={address}
        />
      )}
    </>
  )
}
