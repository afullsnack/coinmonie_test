import QRCode from 'react-qr-code'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'

const truncateAddress = (address: string) =>
  address.length > 14 ? `${address.slice(0, 6)}...${address.slice(-6)}` : address

const DepositQrModal = ({
  open,
  onClose,
  address,
}: {
  open: boolean
  onClose: () => void
  address: string
}) => {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">Scan to deposit</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="relative rounded-xl border border-border bg-white p-4">
            <QRCode value={address} size={220} level="H" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center size-12 rounded-xl bg-white shadow-md ring-4 ring-white">
              <img
                src="/coinmonie_full_logo_rgb_white_transparent.png"
                className="size-8 object-contain brightness-0"
                alt=""
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(address)
              toast.success('Address copied')
            }}
            className="flex items-center gap-2 text-sm font-mono text-secondary-foreground hover:text-primary transition-colors"
          >
            {truncateAddress(address)}
            <Copy className="size-3.5" />
          </button>
          <div className="w-full rounded-xl bg-accent/10 text-accent text-xs px-4 py-3 text-center">
            Any token sent to this address will be swapped to the specified token and recipient.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DepositQrModal
