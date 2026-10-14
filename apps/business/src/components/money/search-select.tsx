import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'

import { Input } from '#/components/ui/input'

export type SearchOption = {
  value: string
  label: string
  hint?: string
  icon: React.ReactNode
}

export function SearchSelect({
  id,
  value,
  options,
  placeholder,
  onChange,
}: {
  id?: string
  value: string | null
  options: SearchOption[]
  placeholder: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = options.find((option) => option.value === value)

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return options
    return options.filter((option) =>
      `${option.label} ${option.hint ?? ''}`.toLowerCase().includes(needle),
    )
  }, [options, query])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <div className="flex h-[52px] items-center gap-2 rounded-[14px] bg-[#2a2a2a] px-3">
        {selected && !open ? selected.icon : <Search className="size-4 shrink-0 text-[#8d8d8d]" />}
        <Input
          id={id}
          role="combobox"
          aria-expanded={open}
          value={open ? query : (selected?.label ?? '')}
          placeholder={placeholder}
          onClick={() => setOpen(true)}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setOpen(false)
            if (event.key === 'Enter' && matches[0]) {
              event.preventDefault()
              onChange(matches[0].value)
              setQuery('')
              setOpen(false)
            }
          }}
          className="h-full border-0 bg-transparent px-0 text-sm text-white shadow-none placeholder:text-[#8d8d8d] focus-visible:ring-0 dark:bg-transparent"
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={open ? 'Close options' : 'Open options'}
          onClick={() => setOpen((current) => !current)}
          className="text-[#cfcfcf] outline-none"
        >
          {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
      </div>
      {open ? (
        <div
          role="listbox"
          className="absolute top-[58px] z-20 w-full rounded-[14px] border border-[#2c2c2c] bg-[#1f1f1f] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
        >
          {matches.length === 0 ? (
            <p className="px-2 py-2 text-sm text-[#8d8d8d]">No matches</p>
          ) : (
            matches.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value)
                  setQuery('')
                  setOpen(false)
                }}
                className="flex h-9 w-full items-center gap-2 rounded-[10px] px-2 text-left text-sm text-[#e8e8e8] outline-none hover:bg-[#2a2a2a]"
              >
                {option.icon}
                {option.label}
                {option.hint ? (
                  <span className="text-xs text-[#8d8d8d] uppercase">({option.hint})</span>
                ) : null}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  )
}
