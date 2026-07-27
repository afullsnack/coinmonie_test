import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { cn, defaultInputStyle } from '#/lib/utils'
import { ChevronDownIcon } from 'lucide-react'

const ReceiveComponent = ({
  handleSendAmountChange,
  sendAmount,
  receiveAmount,
  setIsTokenModalOpen,
  sendToken,
  receiveCurrency,
}: any) => {
  return (
    <div className="bg-secondary-foreground/10 rounded-xl p-4 flex gap-3 items-center justify-between">
      <div className="grid items-center justify-start gap-3">
        <span className="text-secondary-foreground text-sm">
          You'll receive
        </span>
        <Input
          type="text"
          placeholder="0.00"
          value={receiveAmount}
          disabled
          onChange={(e) => handleSendAmountChange(e.target.value)}
          className={cn(
            defaultInputStyle,
            'md:text-4xl text-3xl border-none max-w-xs md:h-20 h-12 bg-transparent text-primary font-semibold placeholder-gray-600 focus-visible:border-none focus:outline-none text-left [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none outline-none',
          )}
        />
        <span className="text-secondary-foreground/60 text-xs">
          NGN{receiveAmount || '0.00'}
        </span>
      </div>
      <div className="flex-1 items-center gap-3">
        <Button
          onClick={() => setIsTokenModalOpen(true)}
          className="flex items-center gap-2 rounded-3xl h-auto max-h-12 px-6! py-4 bg-accent"
          disabled
        >
          <img
            src="/nigeria.png"
            className="size-6 rounded-full object-contain"
          />
          <span className="text-xs md:text-sm text-secondary">NGN Naira</span>
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        </Button>
      </div>
    </div>
  )
}

export default ReceiveComponent
