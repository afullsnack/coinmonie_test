import { cn } from 'cn'

import { Button } from '#/components/ui/button'
import { LoadingDots } from '#/components/auth/loading-dots'

/**
 * The full-width auth CTA: dark gray when disabled, light with dark text when
 * enabled, and the design's dot indicator while pending.
 */
export function PrimaryButton({
  loading,
  disabled,
  className,
  children,
  ...props
}: React.ComponentProps<'button'> & { loading?: boolean; disabled?: boolean }) {
  const enabled = !disabled && !loading
  return (
    <Button
      aria-busy={loading}
      disabled={!enabled}
      className={cn(
        'h-[48px] w-full rounded-[14px] text-sm font-medium',
        loading || enabled
          ? 'bg-[#f5f5f5] text-[#1a1a1a] hover:bg-white'
          : 'bg-[#434343] text-[#9a9a9a] hover:bg-[#434343]',
        'disabled:opacity-100',
        className,
      )}
      {...props}
    >
      {loading ? <LoadingDots /> : children}
    </Button>
  )
}
