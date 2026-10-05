import { XIcon } from 'lucide-react'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '#/components/ui/dialog'
import { FlowerCheck } from '#/components/auth/illustrations'
import { PrimaryButton } from '#/components/auth/primary-button'

/**
 * The centered success dialog shown after creating a password or PIN,
 * over a dimmed, blurred page (see "Password created" designs).
 */
export function SuccessModal({
  title,
  message,
  actionLabel,
  onAction,
  onClose,
}: {
  title: string
  message: string
  actionLabel: string
  onAction: () => void
  onClose: () => void
}) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/70 backdrop-blur-md"
        className="w-[565px] max-w-[calc(100%-48px)] gap-0 rounded-[24px] bg-[#262626] p-[24px] pt-[36px] text-center ring-0 sm:max-w-[565px]"
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
          <XIcon className="size-[22px]" />
        </DialogClose>
        <FlowerCheck className="mx-auto h-[60px] w-[60px]" />
        <DialogTitle className="mt-[24px] text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
          {title}
        </DialogTitle>
        <DialogDescription className="mt-[10px] text-sm text-[#9a9a9a]">
          {message}
        </DialogDescription>
        <PrimaryButton onClick={onAction} className="mt-[24px]">
          {actionLabel}
        </PrimaryButton>
      </DialogContent>
    </Dialog>
  )
}
