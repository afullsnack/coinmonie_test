import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"
import { cn, defaultInputStyle } from "#/lib/utils"
import { ChevronDownIcon } from "lucide-react"



const SendComponent = ({
  handleSendAmountChange,
  sendAmount,
  setIsTokenModalOpen,
	sendToken,
  isUsdLoading,
  fiat,
  rate,
  amountError,
}: any) => {
  const needsToken = Boolean(sendAmount) && !sendToken

  return (
    <div className="bg-secondary-foreground/5 rounded-xl p-4 flex gap-3 items-center justify-between">
      <div className="grid items-center justify-start gap-3">
        <span className="text-secondary-foreground text-sm">You'll send</span>
        <Input
          type="number"
          placeholder="0.00"
          value={sendAmount}
          onChange={(e) => handleSendAmountChange(e.target.value)}
          className={cn(
            defaultInputStyle,
            'md:text-4xl text-3xl border-none max-w-xs md:h-20 h-12 bg-transparent text-primary font-semibold placeholder-gray-600 focus-visible:border-none focus:outline-none text-left [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none outline-none',
          )}
        />
        <span className={cn('text-xs h-4 block', amountError ? 'text-destructive' : 'text-muted-foreground')}>
          {amountError
            ? amountError
            : sendAmount && isUsdLoading
              ? 'Getting value...'
              : sendToken && fiat && typeof rate === 'number'
                ? `1 ${sendToken.code.toUpperCase()} ≈ ${fiat.currency}${rate.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
                : ''}
        </span>
      </div>
      <div className="flex-1 flex flex-col items-end justify-center gap-3">
        <Button
          onClick={() => setIsTokenModalOpen(true)}
          className={cn(
            "flex items-center justify-between gap-2 rounded-xl h-auto max-h-12 px-3! py-4 bg-accent group",
            { "animate-pulse shadow-[0_0_0_3px_var(--color-accent)] shadow-accent/40": needsToken },
          )}
        >
          {!sendToken && (
            <span className="text-xs md:text-sm">Choose asset</span>
          )}
          {sendToken && (
						<>
							<div className="relative rounded-full w-6">
	              <img
	                src={sendToken.url}
	                className="m-0! size-6! rounded-full object-contain"
	              />
	              <img
	                src={sendToken.blockchain.url}
	                className="m-0! size-3! rounded-full object-contain absolute bottom-0 inset-e-0 border border-accent group-hover:border-primary"
	              />
							</div>
              <span className="text-accent-foreground font-medium">
                {sendToken.code.toUpperCase()}
              </span>
            </>
          )}
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
				</Button>
				<span className="text-[10px] font-semibold text-center h-3.5">
					{sendToken ? `${sendToken.code} on ${sendToken.blockchain.name}` : ''}
				</span>
      </div>
    </div>
  )
}

export default SendComponent
