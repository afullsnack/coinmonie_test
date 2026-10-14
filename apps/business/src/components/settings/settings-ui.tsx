import { ChevronRight } from 'lucide-react'
import { cn } from 'cn'

import { Input } from '#/components/ui/input'
import { Separator } from '#/components/ui/separator'

export const FIELD =
  'h-10 rounded-[10px] border-0 bg-[#2a2a2a] px-3 text-sm text-[#f0f0f0] placeholder:text-[#8d8d8d] focus-visible:ring-1 focus-visible:ring-[#444] dark:bg-[#2a2a2a]'

export function SectionTitle({
  children,
  description,
  action,
}: {
  children: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h2 className="text-[17px] font-semibold text-[#f5f5f5]">{children}</h2>
        {description ? <p className="mt-0.5 text-sm text-[#9a9a9a]">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function SettingsDivider() {
  return <Separator className="my-6 bg-[#2c2c2c]" />
}

export function ChevronPill() {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#3a3a3a] text-[#d0d0d0]">
      <ChevronRight className="size-3.5" />
    </span>
  )
}

export function SettingsRow({
  icon: Icon,
  label,
  trailing,
  onClick,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>
  label: React.ReactNode
  trailing?: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  const body = (
    <>
      {Icon ? <Icon className="size-3.5 shrink-0 text-[#bdbdbd]" /> : null}
      <span className="flex min-w-0 flex-1 items-center gap-1.5 py-2 text-left">{label}</span>
      {trailing ? <span className="flex shrink-0 items-center gap-2 whitespace-nowrap">{trailing}</span> : null}
    </>
  )
  const base = cn(
    'flex min-h-[48px] w-full items-center gap-2 rounded-[12px] bg-[#262626] px-3 text-sm text-[#f0f0f0]',
    className,
  )
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(base, 'outline-none hover:bg-[#2c2c2c]')}>
        {body}
      </button>
    )
  }
  return <div className={base}>{body}</div>
}

export function IconInput({
  icon: Icon,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#9a9a9a]" />
      <Input className={cn(FIELD, 'pl-8', className)} {...props} />
    </div>
  )
}
