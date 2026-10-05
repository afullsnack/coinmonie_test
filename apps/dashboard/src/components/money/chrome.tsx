import { ChevronDown, ChevronLeft, Search, X } from 'lucide-react'
import { cn } from 'cn'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '#/components/ui/input-group'
import { Badge } from '#/components/ui/badge'

export type Tone = 'successful' | 'processing' | 'failed' | 'cancelled' | 'pending'

const TONE: Record<Tone, string> = {
  successful: 'bg-[#16301f] text-[#3ddc84]',
  processing: 'bg-[#3a3012] text-[#f0c14b]',
  failed: 'bg-[#3a1719] text-[#ff5d5d]',
  cancelled: 'bg-[#3a1719] text-[#ff5d5d]',
  pending: 'bg-[#16263d] text-[#79a7ff]',
}

export function StatusBadge({
  tone,
  children,
}: {
  tone: Tone
  children: React.ReactNode
}) {
  return (
    <Badge
      variant="ghost"
      className={cn(
        'h-6 rounded-full px-2.5 text-[12px] font-medium',
        TONE[tone],
      )}
    >
      {children}
    </Badge>
  )
}

export function Initials({
  children,
  color,
  className,
}: {
  children: React.ReactNode
  color: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white',
        className,
      )}
      style={{ backgroundColor: color }}
    >
      {children}
    </span>
  )
}

export function UsdcMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-full bg-[#2775ca] text-[10px] font-bold text-white',
        className,
      )}
    >
      $
    </span>
  )
}

export function SearchField({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
}) {
  return (
    <InputGroup
      className={cn(
        'h-11 rounded-[12px] border-0 bg-[#242424] shadow-none has-[[data-slot=input-group-control]:focus-visible]:ring-0',
        className,
      )}
    >
      <InputGroupAddon className="text-[#8d8d8d]">
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="text-sm text-[#f5f5f5] placeholder:text-[#8d8d8d]"
      />
      {value ? (
        <InputGroupAddon align="inline-end">
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onChange('')}
            className="flex size-6 items-center justify-center rounded-full text-[#cfcfcf] outline-none hover:text-white"
          >
            <X className="size-3.5" />
          </button>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  )
}

export type FilterOption = {
  value: string
  label: string
  node?: React.ReactNode
}

export function FilterMenu({
  idleLabel,
  value,
  options,
  onChange,
}: {
  idleLabel: string
  value: string
  options: FilterOption[]
  onChange: (value: string) => void
}) {
  const selected = options.find((option) => option.value === value)
  const active = value !== 'all' && selected

  return (
    <DropdownMenu>
      <div className="flex h-11 items-center rounded-[12px] bg-[#242424] pr-2 pl-1">
        <DropdownMenuTrigger className="flex h-11 items-center gap-2 rounded-[12px] bg-transparent px-3 text-sm text-[#f3f3f3] outline-none">
          <span className="flex items-center gap-2">
            {active ? (selected.node ?? selected.label) : idleLabel}
          </span>
          {active ? null : <ChevronDown className="size-4 text-[#bdbdbd]" />}
        </DropdownMenuTrigger>
        {active ? (
          <button
            type="button"
            aria-label={`Clear ${idleLabel} filter`}
            onClick={() => onChange('all')}
            className="flex size-6 items-center justify-center rounded-full text-[#d0d0d0] outline-none hover:text-white"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>
      <DropdownMenuContent className="min-w-[190px] rounded-[14px] border border-[#333] bg-[#2a2a2a] p-1.5 text-[#f5f5f5] shadow-xl ring-0">
        <DropdownMenuGroup>
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              className="rounded-[10px] px-3 py-2 text-sm text-[#f3f3f3] focus:bg-[#3a3a3a] focus:text-white"
              onClick={() => onChange(option.value)}
            >
              {option.node ?? option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function FlowFrame({
  onBack,
  children,
  toast,
}: {
  onBack: () => void
  children: React.ReactNode
  toast?: React.ReactNode
}) {
  return (
    <div className="min-h-dvh bg-[#121212] font-sans text-[#e8e8e8] antialiased">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1120px] flex-col px-8 pt-6 pb-16">
        <div className="flex items-start justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 items-center gap-1.5 rounded-full bg-[#2a2a2a] px-4 text-sm text-[#f3f3f3] outline-none hover:bg-[#333]"
          >
            <ChevronLeft className="size-4" />
            Back
          </button>
          {toast}
        </div>
        {children}
      </div>
    </div>
  )
}

export function SavedToast({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="flex h-10 items-center gap-2 rounded-full bg-[#2a2a2a] px-4 text-sm text-[#f3f3f3] shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
      <span className="flex size-4 items-center justify-center rounded-full bg-[#1f8a4c] text-[10px] text-white">
        ✓
      </span>
      {children}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onClose}
        className="ml-1 text-[#cfcfcf] outline-none hover:text-white"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}

export function TopToast({
  tone = 'success',
  children,
  onClose,
  className,
}: {
  tone?: 'success' | 'info'
  children: React.ReactNode
  onClose: () => void
  className?: string
}) {
  return (
    <div
      role="status"
      className={cn(
        'fixed top-6 left-1/2 z-[60] flex h-10 -translate-x-1/2 items-center gap-2 rounded-[12px] bg-[#2a2a2a] px-3 text-sm whitespace-nowrap text-[#a6a6a6] shadow-[0_8px_24px_rgba(0,0,0,0.35)]',
        className,
      )}
    >
      <span
        className={cn(
          'flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white',
          tone === 'success' ? 'bg-[#30c463]' : 'bg-[#3b82f6]',
        )}
      >
        {tone === 'success' ? '✓' : 'i'}
      </span>
      <span className="[&_b]:font-medium [&_b]:text-[#f5f5f5]">{children}</span>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onClose}
        className="ml-6 text-[#cfcfcf] outline-none hover:text-white"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}

const QR_CELLS = [
  '1110111', '1010001', '1100101', '0011100', '1101011', '1000101', '1110111',
]

export function QrMark({
  badge,
  className,
}: {
  badge?: React.ReactNode
  className?: string
}) {
  return (
    <span className={cn('relative block size-[54px] shrink-0', className)} aria-hidden="true">
      <svg viewBox="0 0 7 7" className="size-full" shapeRendering="crispEdges">
        {QR_CELLS.flatMap((row, y) =>
          [...row].map((cell, x) =>
            cell === '1' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#f2f2f2" /> : null,
          ),
        )}
        {[
          [0, 0],
          [4, 0],
          [0, 4],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <rect x={x} y={y} width="3" height="3" rx="0.5" fill="#f2f2f2" />
            <rect x={x + 0.6} y={y + 0.6} width="1.8" height="1.8" rx="0.3" fill="#1c1c1c" />
            <rect x={x + 1.05} y={y + 1.05} width="0.9" height="0.9" fill="#f2f2f2" />
          </g>
        ))}
      </svg>
      {badge ? (
        <span className="absolute inset-0 flex items-center justify-center">{badge}</span>
      ) : null}
    </span>
  )
}

export function SuccessCloud() {
  return (
    <svg viewBox="0 0 72 56" className="mx-auto h-16 w-20" aria-hidden="true">
      <path
        d="M22 40c-8 0-14-6-14-13 0-6 4-11 10-12 1-7 8-12 16-12 7 0 13 4 15 10 7 1 12 6 12 13 0 8-7 14-16 14H22z"
        fill="#7fd4ef"
      />
      <path
        d="M30 30l5 5 10-12"
        fill="none"
        stroke="#fff"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function FailMark() {
  return (
    <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#e5484d] text-white">
      <X className="size-7" />
    </span>
  )
}

export function ClockMark() {
  return (
    <svg viewBox="0 0 64 64" className="mx-auto size-16" aria-hidden="true">
      <circle cx="32" cy="34" r="18" fill="#d7f3fb" />
      <circle cx="32" cy="34" r="14" fill="#9fdcf0" />
      <path d="M32 26v9l6 4" stroke="#1b4d63" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M18 18c6-6 22-8 30-2" stroke="#7ec8e0" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
