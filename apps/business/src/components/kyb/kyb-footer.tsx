import { cn } from 'cn'

import { PrimaryButton } from '#/components/auth/primary-button'
import { Separator } from '#/components/ui/separator'

/**
 * The KYB footer: divider, a dark Cancel/Back button on the left and the
 * step's primary action on the right.
 */
export function KybFooter({
  leftLabel,
  onLeft,
  rightLabel,
  rightEnabled = true,
  rightLoading,
  onRight,
}: {
  leftLabel: string
  onLeft: () => void
  rightLabel: string
  rightEnabled?: boolean
  rightLoading?: boolean
  onRight: () => void
}) {
  return (
    <footer>
      <Separator className="mt-[24px] bg-[#2f2f2f]" />
      <div className="mt-[12px] flex items-center justify-between">
        <button
          type="button"
          onClick={onLeft}
          className="h-[48px] rounded-[12px] bg-[#2b2b2b] px-[24px] text-sm font-medium text-[#f5f5f5] transition-colors outline-none hover:bg-[#333333]"
        >
          {leftLabel}
        </button>
        <PrimaryButton
          type="button"
          disabled={!rightEnabled}
          loading={rightLoading}
          onClick={onRight}
          className={cn('w-auto px-[28px]')}
        >
          {rightLabel}
        </PrimaryButton>
      </div>
    </footer>
  )
}
