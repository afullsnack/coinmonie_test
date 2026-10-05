import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'

/**
 * The floating "Owner removed" confirmation pill from the design, top-center
 * with a close button; auto-dismisses.
 */
export function KybToast({
  message,
  onDismiss,
}: {
  message: string
  onDismiss: () => void
}) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 4000)
    return () => window.clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      role="status"
      className="fixed top-[16px] left-1/2 z-50 flex w-[488px] max-w-[calc(100%-48px)] -translate-x-1/2 items-center gap-[10px] rounded-[10px] bg-[#2b2b2b] py-[12px] pr-[14px] pl-[16px] shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
    >
      <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-[#30c463] text-white">
        <Check className="size-[11px] stroke-3" />
      </span>
      <span className="flex-1 text-sm text-[#e6e6e6]">{message}</span>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="text-[#9a9a9a] outline-none hover:text-white"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

export function useKybToast() {
  const [toast, setToast] = useState<string | null>(null)
  return {
    toast,
    showToast: setToast,
    dismiss: () => setToast(null),
  }
}
