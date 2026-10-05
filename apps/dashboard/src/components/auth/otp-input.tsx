import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { cn } from 'cn'

import { InputOTP } from '#/components/ui/input-otp'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  error?: boolean
  disabled?: boolean
  /** Render dots instead of digits (PIN screens). */
  masked?: boolean
  length?: number
  label?: string
  autoFocus?: boolean
}

const SLOT =
  'relative flex h-[42px] w-[40px] items-center justify-center rounded-[2px] bg-[#3a3a3a] text-[15px] font-medium text-[#e6e6e6] transition-colors outline-none first:rounded-l-[9px] last:rounded-r-[9px]'
const SLOT_ACTIVE = 'bg-[#454545]'
const CARET = (
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
    <div className="h-4 w-px animate-caret-blink bg-[#e6e6e6] duration-1000" />
  </div>
)

/**
 * The joined box group from the verify-email / PIN designs, built on the
 * shadcn InputOTP primitive. One controlled string of digits; typing
 * advances, backspace retreats, arrows navigate, paste and SMS/email
 * one-time-code autofill fill every box.
 */
export function OtpInput({
  value,
  onChange,
  error,
  disabled,
  masked,
  length = 6,
  label = 'Verification code',
  autoFocus,
}: OtpInputProps) {
  return (
    <div
      className={
        error
          ? 'rounded-[9px] border border-[#e5484d] p-[1px] shadow-[0_0_0_3px_rgba(229,72,77,0.1)]'
          : 'rounded-[9px] border border-transparent p-[1px]'
      }
    >
      <InputOTP
        value={value}
        onChange={onChange}
        maxLength={length}
        pattern={REGEXP_ONLY_DIGITS}
        inputMode="numeric"
        autoComplete={masked ? 'off' : 'one-time-code'}
        autoFocus={autoFocus}
        aria-invalid={error || undefined}
        disabled={disabled}
        aria-label={label}
        render={({ slots }) => (
          <div className="flex gap-[2px]">
            {slots.map((slot, index) => (
              <div
                key={index}
                className={cn(
                  SLOT,
                  slot.isActive && SLOT_ACTIVE,
                  error && 'bg-[#2a1518] text-[#e5484d]',
                  error && slot.isActive && 'bg-[#331a1d]',
                )}
              >
                {masked ? (slot.char !== null ? '•' : null) : slot.char}
                {slot.hasFakeCaret ? CARET : null}
              </div>
            ))}
          </div>
        )}
      />
    </div>
  )
}
