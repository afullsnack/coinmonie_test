import { Fingerprint, X } from 'lucide-react'
import { cn } from 'cn'

const KEY =
  'flex h-[64px] w-full max-w-[120px] items-center justify-center rounded-full text-[26px] font-medium text-[#e6e6e6] outline-none transition-colors hover:bg-[#242424] focus-visible:ring-2 focus-visible:ring-[#5a5a5a] disabled:pointer-events-none disabled:opacity-50'

/**
 * The 3×4 numeric keypad from the PIN designs; last row is fingerprint, 0
 * and a red backspace. The fingerprint key signs in with a passkey when a
 * handler is given and is inert otherwise.
 */
export function Keypad({
  onDigit,
  onBackspace,
  onBiometric,
  disabled,
}: {
  onDigit: (digit: string) => void
  onBackspace: () => void
  onBiometric?: () => void
  disabled?: boolean
}) {
  return (
    <div className="grid grid-cols-3 justify-items-center gap-y-[14px]">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
        <button key={digit} type="button" disabled={disabled} className={KEY} onClick={() => onDigit(digit)}>
          {digit}
        </button>
      ))}
      <button
        type="button"
        aria-label="Use passkey"
        disabled={disabled}
        tabIndex={onBiometric ? undefined : -1}
        aria-hidden={onBiometric ? undefined : true}
        className={cn(KEY, !onBiometric && 'cursor-default hover:bg-transparent')}
        onClick={onBiometric}
      >
        <Fingerprint aria-hidden="true" className="size-[24px]" />
      </button>
      <button type="button" disabled={disabled} className={KEY} onClick={() => onDigit('0')}>
        0
      </button>
      <button
        type="button"
        aria-label="Delete digit"
        disabled={disabled}
        className={cn(KEY, 'text-[#e5484d]')}
        onClick={onBackspace}
      >
        <X aria-hidden="true" className="size-[24px]" />
      </button>
    </div>
  )
}
