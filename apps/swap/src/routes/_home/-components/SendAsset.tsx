import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"
import { cn, defaultInputStyle } from "#/lib/utils"
import { ChevronDownIcon } from "lucide-react"



const SendComponent = ({
  handleSendAmountChange,
  sendAmount,
  setIsTokenModalOpen,
  sendToken,
}: any) => {
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
        <span className="text-muted-foreground text-xs">
          $
          {((sendToken?.current_price || 1) * sendAmount).toLocaleString(
            'en-US',
          ) || '0.00'}
        </span>
      </div>
      <div className="flex-1 items-center gap-3">
        <Button
          onClick={() => setIsTokenModalOpen(true)}
          className="flex items-center justify-between gap-2 rounded-3xl h-auto max-h-12 px-6! py-4 bg-accent"
        >
          {!sendToken && (
            <span className="text-xs md:text-sm">Choose token</span>
          )}
          {sendToken && (
            <>
              <img
                src={sendToken.image}
                className="m-0! size-6! rounded-full object-contain"
              />
              <span className="text-white font-medium">
                {sendToken.code.toUpperCase()}
              </span>
            </>
          )}
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        </Button>
      </div>
    </div>
  )
}

export default SendComponent
