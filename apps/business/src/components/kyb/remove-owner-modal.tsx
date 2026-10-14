import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '#/components/ui/dialog'
import { TrashIllustration } from '#/components/kyb/illustrations'

/**
 * The "Remove owner" confirmation dialog from the design: red trash, bold
 * owner name, and No / "Yes, remove" actions.
 */
export function RemoveOwnerModal({
  ownerName,
  onConfirm,
  onClose,
}: {
  ownerName: string
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/70 backdrop-blur-md"
        className="w-[542px] max-w-[calc(100%-48px)] gap-0 rounded-[24px] bg-[#262626] p-[28px] text-center ring-0 sm:max-w-[542px]"
      >
        <DialogClose
          render={
            <button
              type="button"
              aria-label="Close"
              className="absolute top-[22px] right-[22px] text-[#e6e6e6] outline-none hover:text-white"
            />
          }
        >
          <X />
        </DialogClose>
        <TrashIllustration className="mx-auto mt-[8px]" />
        <DialogTitle className="mt-[20px] text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
          Remove owner
        </DialogTitle>
        <DialogDescription className="mt-[10px] text-sm text-[#9a9a9a]">
          Are you sure you want to remove{' '}
          <strong className="font-semibold text-[#e6e6e6]">{ownerName}</strong>{' '}
          as an owner?
        </DialogDescription>
        <div className="mt-[24px] flex gap-[10px]">
          <button
            type="button"
            onClick={onClose}
            className="h-[48px] flex-1 rounded-[12px] bg-[#2b2b2b] text-sm font-medium text-[#f5f5f5] transition-colors outline-none hover:bg-[#333333]"
          >
            No
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-[48px] flex-1 rounded-[12px] bg-[#e5484d] text-sm font-medium text-white transition-colors outline-none hover:bg-[#d63c41]"
          >
            Yes, remove
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function X() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="size-[22px]"
    >
      <path
        d="M6 6 L18 18 M18 6 L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
