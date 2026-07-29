
import {
  Dialog,
  DialogContent,
} from './ui/dialog'
import {QRCode} from "react-qr-code"

interface QrCodeModalProps {
  open: boolean
  onClose: () => void
  address: string
}

export function BankSelectorModal({
  open,
	onClose,
	address
}: QrCodeModalProps) {

  if (!open) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(openVal: boolean) => {
        if (!openVal) {
          onClose()
        }
      }}
    >
      <DialogContent className="overflow-hidden">
				<div className="w-full flex flex-col items-start justify-start gap-3">
					<QRCode
						value={address}
						size={265}
					/>
        </div>
      </DialogContent>
    </Dialog>
  )
}
