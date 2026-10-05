import { useRouter } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { Separator } from '#/components/ui/separator'

/**
 * The pill "Back" button plus full-width divider used on the reset flows
 * (see Reset password / Reset PIN designs).
 */
export function BackHeader({ onBack }: { onBack?: () => void }) {
  const router = useRouter()
  return (
    <header>
      <div className="flex h-[83px] items-center px-10">
        <button
          type="button"
          onClick={onBack ?? (() => router.history.back())}
          className="flex items-center gap-[8px] rounded-full bg-[#2e2e2e] py-[10px] pr-[20px] pl-[16px] text-[13px] font-medium text-[#e6e6e6] transition-colors outline-none hover:bg-[#383838]"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
          Back
        </button>
      </div>
      <Separator className="bg-[#2b2b2b]" />
    </header>
  )
}
