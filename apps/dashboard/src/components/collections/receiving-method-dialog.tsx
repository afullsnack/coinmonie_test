import { useNavigate } from '@tanstack/react-router'
import { ChevronRight, Landmark, Wallet, X } from 'lucide-react'

import { Dialog, DialogContent, DialogTitle } from '#/components/ui/dialog'

export function ReceivingMethodDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/60 backdrop-blur-md"
        className="w-[400px] gap-4 rounded-[22px] bg-[#1c1c1c] p-4 ring-0 sm:max-w-[400px]"
      >
        <div className="flex items-center justify-between">
          <DialogTitle className="text-lg font-semibold text-white">
            Add receiving method
          </DialogTitle>
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="text-white outline-none"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex flex-col gap-[2px]">
          <MethodRow
            icon={Landmark}
            label="Bank account"
            className="rounded-t-[12px]"
            onClick={() => navigate({ to: '/add-bank-account' })}
          />
          <MethodRow
            icon={Wallet}
            label="Wallet address"
            className="rounded-b-[12px]"
            onClick={() => navigate({ to: '/add-wallet-address' })}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function MethodRow({
  icon: Icon,
  label,
  className,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  className?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[42px] w-full items-center gap-2 bg-[#2a2a2a] px-3 text-sm text-[#f3f3f3] outline-none hover:bg-[#323232] ${className ?? ''}`}
    >
      <Icon className="size-4 text-[#bdbdbd]" />
      <span className="flex-1 text-left">{label}</span>
      <span className="flex size-6 items-center justify-center rounded-full bg-[#3a3a3a]">
        <ChevronRight className="size-3.5 text-[#d0d0d0]" />
      </span>
    </button>
  )
}
