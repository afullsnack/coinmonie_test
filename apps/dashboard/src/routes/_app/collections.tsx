import { useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ChevronRight, Copy, Plus, Share2 } from 'lucide-react'
import { cn } from 'cn'
import { z } from 'zod'

import { ReceivingMethodDialog } from '#/components/collections/receiving-method-dialog'
import { OrbsIllustration } from '#/components/dashboard/illustrations'
import { Initials, QrMark, SearchField, StatusBadge, UsdcMark } from '#/components/money/chrome'
import type { Tone } from '#/components/money/chrome'
import { DataTable, createDataColumns } from '#/components/money/data-table'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'

const searchSchema = z.object({
  empty: z.boolean().optional(),
})

export const Route = createFileRoute('/_app/collections')({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: 'Collections · CoinMonie' }] }),
  component: CollectionsPage,
})

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'stablecoin', label: 'Stablecoin addresses' },
  { value: 'local', label: 'Local / virtual accounts' },
] as const

type Collection = {
  id: string
  kind: 'stablecoin' | 'local'
  rail: string
  title: string
  label: string
  value: string
  copyLabel: string
  badge: React.ReactNode
}

const COLLECTIONS: Collection[] = [
  {
    id: 'usdc-base',
    kind: 'stablecoin',
    rail: 'Base network',
    title: 'USDC',
    label: 'Deposit address',
    value: '0x7a3f9C2b41E8d0A6f5c1Bd7e2A9b21c',
    copyLabel: 'Copy address',
    badge: <UsdcMark className="size-[18px] ring-2 ring-[#1c1c1c]" />,
  },
  {
    id: 'usdt-tron',
    kind: 'stablecoin',
    rail: 'Tron network',
    title: 'USDT',
    label: 'Deposit address',
    value: 'TQn9pXvR4k7mJ2sLd8Wq3YbF1cYb2c',
    copyLabel: 'Copy address',
    badge: (
      <span className="flex size-[18px] items-center justify-center rounded-full bg-[#26a17b] text-[10px] font-bold text-white ring-2 ring-[#1c1c1c]">
        T
      </span>
    ),
  },
  {
    id: 'usd-account',
    kind: 'local',
    rail: 'ACH · Wire',
    title: 'USD account',
    label: 'Account · Routing',
    value: '8842 1047 · 021 000 021',
    copyLabel: 'Copy details',
    badge: <FlagBadge flag="🇺🇸" />,
  },
  {
    id: 'eur-account',
    kind: 'local',
    rail: 'SEPA',
    title: 'EUR account',
    label: 'IBAN',
    value: 'DE89 3704 0044 0532 0130 9930',
    copyLabel: 'Copy IBAN',
    badge: <FlagBadge flag="🇪🇺" />,
  },
]

type HistoryRow = {
  id: string
  name: string
  initials: string
  color: string
  via: string
  amount: string
  status: string
  tone: Tone
  date: string
}

const HISTORY: HistoryRow[] = [
  {
    id: 'northwind',
    name: 'Northwind Inc',
    initials: 'NW',
    color: '#f0742e',
    via: 'USDC · Base',
    amount: '8,000 USDC',
    status: 'Processing',
    tone: 'processing',
    date: 'Aug 26, 2025 11:45 AM',
  },
  {
    id: 'meridian',
    name: 'Meridian Ltd',
    initials: 'ML',
    color: '#3b82f6',
    via: 'USD wire',
    amount: '$12,000',
    status: 'Credited',
    tone: 'successful',
    date: 'Aug 26, 2025 11:45 AM',
  },
  {
    id: 'acme',
    name: 'Acme GmbH',
    initials: 'AG',
    color: '#8b5cf6',
    via: 'EUR · SEPA',
    amount: '€6,500',
    status: 'Credited',
    tone: 'successful',
    date: 'Aug 26, 2025 11:45 AM',
  },
]

const col = createDataColumns<HistoryRow>()

const HISTORY_COLUMNS = col.columns([
  col.accessor('name', {
    header: 'Recipient',
    meta: { width: '25%' },
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <Initials color={row.original.color} className="size-7 text-[10px]">
          {row.original.initials}
        </Initials>
        <div className="leading-tight">
          <p className="text-[13px] font-medium text-[#f5f5f5]">{row.original.name}</p>
          <p className="text-xs text-[#9a9a9a]">{row.original.via}</p>
        </div>
      </div>
    ),
  }),
  col.accessor('amount', { header: 'Amount', meta: { width: '25%' } }),
  col.accessor('status', {
    header: 'Status',
    meta: { width: '25%' },
    cell: ({ row }) => <StatusBadge tone={row.original.tone}>{row.original.status}</StatusBadge>,
  }),
  col.accessor('date', { header: 'Date' }),
])

function CollectionsPage() {
  const { empty } = Route.useSearch()
  const [tab, setTab] = useState<(typeof TABS)[number]['value']>('all')
  const [query, setQuery] = useState('')
  const [methodOpen, setMethodOpen] = useState(false)

  const collections = empty ? [] : COLLECTIONS
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return collections.filter((item) => {
      if (tab !== 'all' && item.kind !== tab) return false
      if (!needle) return true
      return `${item.title} ${item.rail} ${item.value}`.toLowerCase().includes(needle)
    })
  }, [collections, query, tab])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[15px] font-medium text-[#f5f5f5]">All Collections</h1>
        <div className="flex items-center gap-2">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search account..."
            className="h-10 w-[236px] rounded-full"
          />
          <button
            type="button"
            onClick={() => setMethodOpen(true)}
            className="flex h-10 items-center gap-2 rounded-full bg-[#f0f0f0] px-4 text-sm font-medium text-[#1a1a1a] outline-none hover:bg-white"
          >
            <Plus className="size-4" />
            Add receiving method
          </button>
        </div>
      </div>

      <div className="flex gap-[3px]">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            className={cn(
              'h-[34px] flex-1 rounded-[10px] text-sm outline-none transition-colors',
              tab === item.value
                ? 'bg-[#3a3a3a] text-[#f5f5f5]'
                : 'bg-[#262626] text-[#d7d7d7] hover:text-white',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Empty className="border-0 py-10">
          <EmptyHeader>
            <EmptyMedia>
              <OrbsIllustration />
            </EmptyMedia>
            <EmptyTitle className="text-xl text-white">
              {collections.length === 0 ? 'You don’t have any collection yet' : 'No results found'}
            </EmptyTitle>
            <EmptyDescription>
              {collections.length === 0
                ? 'Add a bank account or address'
                : 'Try a different keyword or switch tabs.'}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <button
              type="button"
              onClick={() => setMethodOpen(true)}
              className="flex h-9 items-center gap-2 rounded-full bg-[#f0f0f0] px-4 text-sm font-medium text-[#1a1a1a] outline-none hover:bg-white"
            >
              <Plus className="size-4" />
              Create collection
            </button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          {visible.map((item) => (
            <CollectionCard key={item.id} collection={item} />
          ))}
        </div>
      )}

      {collections.length > 0 ? (
        <section className="mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-medium text-[#f5f5f5]">Collection history</h2>
            <Link
              to="/transactions"
              className="flex items-center gap-1 text-sm text-[#d7d7d7] outline-none hover:text-white"
            >
              View all
              <ChevronRight className="size-4" />
            </Link>
          </div>
          <DataTable
            tone="raised"
            columns={HISTORY_COLUMNS}
            data={HISTORY}
            getRowId={(row) => row.id}
            rowClassName="[&>td]:h-[52px]"
          />
        </section>
      ) : null}

      <ReceivingMethodDialog open={methodOpen} onOpenChange={setMethodOpen} />
    </div>
  )
}

function CollectionCard({ collection }: { collection: Collection }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard?.writeText(collection.value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const share = async () => {
    const text = `${collection.title} · ${collection.rail}\n${collection.label}: ${collection.value}`
    if (navigator.share) {
      await navigator.share({ title: collection.title, text }).catch(() => undefined)
      return
    }
    await copy()
  }

  return (
    <article className="flex items-center justify-between gap-4 rounded-[16px] border border-[#262626] bg-[#1c1c1c] p-4">
      <div className="min-w-0">
        <p className="text-xs text-[#9a9a9a]">{collection.rail}</p>
        <p className="text-[15px] font-semibold text-[#f5f5f5]">{collection.title}</p>
        <p className="mt-3 text-xs text-[#9a9a9a]">{collection.label}</p>
        <p className="truncate text-[15px] text-[#f0f0f0]">{collection.value}</p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={copy}
            className="flex h-9 items-center gap-2 rounded-[10px] bg-[#2a2a2a] px-3 text-sm text-[#e8e8e8] outline-none hover:bg-[#333]"
          >
            <Copy className="size-3.5" />
            {copied ? 'Copied' : collection.copyLabel}
          </button>
          <button
            type="button"
            onClick={share}
            className="flex h-9 items-center gap-2 rounded-[10px] bg-[#f0f0f0] px-3 text-sm font-medium text-[#1a1a1a] outline-none hover:bg-white"
          >
            <Share2 className="size-3.5" />
            Share
          </button>
        </div>
      </div>
      <QrMark badge={collection.badge} className="mr-4" />
    </article>
  )
}

function FlagBadge({ flag }: { flag: string }) {
  return (
    <span className="flex size-[18px] items-center justify-center overflow-hidden rounded-full bg-[#1c1c1c] text-[14px] leading-none ring-2 ring-[#1c1c1c]">
      {flag}
    </span>
  )
}
