import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { cn, defaultInputStyle } from '#/lib/utils'
import { isFlagImage } from '#/data/constants'
import { ChevronDownIcon, Loader2 } from 'lucide-react'

const ReceiveComponent = ({
  receiveAmount,
  setIsFiatModalOpen,
	fiat,
  isRateLoading,
}: any) => {
  return (
    <div className="bg-secondary-foreground/10 rounded-xl p-4 flex gap-3 items-center justify-between">
      <div className="grid items-center justify-start gap-3">
        <span className="text-secondary-foreground text-sm">
          You'll receive
        </span>
        {isRateLoading ? (
          <div className="flex items-center gap-2 h-12 md:h-20">
            <Loader2 className="animate-spin size-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Getting rate...</span>
          </div>
        ) : (
          <Input
            type="text"
            placeholder="0.00"
            value={receiveAmount}
            disabled
            className={cn(
              defaultInputStyle,
              'md:text-4xl text-3xl border-none max-w-xs md:h-20 h-12 bg-transparent text-primary font-semibold placeholder-gray-600 focus-visible:border-none focus:outline-none text-left [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none outline-none',
            )}
          />
        )}
        <span className="text-secondary-foreground/60 text-xs h-4 block">
          {fiat?.currency}{receiveAmount || '0.00'}
        </span>
      </div>
      <div className="flex-1 flex flex-col items-end gap-3">
        <div className="h-12 md:h-20 flex items-end pb-0 translate-y-[26px] md:translate-y-2">
          <Button
            onClick={() => setIsFiatModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl h-auto max-h-12 px-6! py-4 bg-accent"
          >
            {fiat && (
              isFlagImage(fiat.url) ? (
                <img
                  src={fiat.url}
                  className="size-6 rounded-full object-contain"
                />
              ) : (
                <span className="text-lg leading-none" aria-hidden="true">{fiat.url}</span>
              )
            )}
            <span className="text-xs md:text-sm text-secondary">{fiat?.currency ?? 'Choose currency'}</span>
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
					</Button>
				</div>
        <span className="text-[10px] font-semibold text-center h-3.5 mt-[26px]">{fiat?.name ?? ''}</span>
      </div>
    </div>
  )
}

export default ReceiveComponent
