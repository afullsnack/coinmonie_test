import { useMemo, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Download, Plus } from 'lucide-react'

import { PrimaryButton } from '#/components/auth/primary-button'
import { BookIllustration, OrbsIllustration } from '#/components/dashboard/illustrations'
import { FilterMenu, Initials, SearchField, StatusBadge, UsdcMark } from '#/components/money/chrome'
import { DataTable, createDataColumns } from '#/components/money/data-table'
import { TransactionDetail } from '#/components/transactions/detail-sheet'
import { TRANSACTIONS, type Tx } from '#/components/transactions/data'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'

export const Route = createFileRoute('/_app/transactions')({
  head: () => ({ meta: [{ title: 'Transactions · CoinMonie' }] }),
  component: TransactionsPage,
})

function TransactionsPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [currency, setCurrency] = useState('all')
  const [type, setType] = useState('all')
  const [date, setDate] = useState('all')
  const [selected, setSelected] = useState<Tx | null>(null)

  const filtered = useMemo(() => {
    return TRANSACTIONS.filter((tx) => {
      const haystack = `${tx.name} ${tx.amount} ${tx.id} ${tx.status}`.toLowerCase()
      if (query && !haystack.includes(query.trim().toLowerCase())) return false
      if (status === 'successful' && tx.tone !== 'successful') return false
      if (status === 'processing' && tx.tone !== 'processing') return false
      if (status === 'pending' && tx.tone !== 'pending') return false
      if (status === 'failed' && tx.tone !== 'failed') return false
      if (status === 'cancelled' && tx.tone !== 'cancelled') return false
      if (currency !== 'all' && tx.currency !== currency) return false
      if (type !== 'all' && tx.type !== type) return false
      return true
    })
  }, [currency, query, status, type])

  const clear = () => {
    setQuery('')
    setStatus('all')
    setCurrency('all')
    setType('all')
    setDate('all')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search by name, ID or reference..."
          className="min-w-[240px] flex-1"
        />
        <FilterMenu
          idleLabel="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: 'All' },
            { value: 'successful', label: 'Successful' },
            { value: 'processing', label: 'In progress' },
            { value: 'pending', label: 'Pending' },
            { value: 'failed', label: 'Failed' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
        />
        <FilterMenu
          idleLabel="Currency"
          value={currency}
          onChange={setCurrency}
          options={[
            { value: 'all', label: 'All currencies' },
            { value: 'USDC', label: 'USDC', node: <span className="flex items-center gap-2"><UsdcMark /> USDC</span> },
            { value: 'Naira', label: 'Naira', node: <span>🇳🇬 Naira</span> },
            { value: 'Cedi', label: 'Cedi', node: <span>🇬🇭 Cedi</span> },
            { value: 'Shilling', label: 'Shilling', node: <span>🇰🇪 Shilling</span> },
          ]}
        />
        <FilterMenu
          idleLabel="Type"
          value={type}
          onChange={setType}
          options={[
            { value: 'all', label: 'All types' },
            { value: 'Received', label: 'Received' },
            { value: 'Payout', label: 'Payout' },
            { value: 'Conversion', label: 'Conversion' },
            { value: 'Withdrawal', label: 'Withdrawal' },
          ]}
        />
        <FilterMenu
          idleLabel="Date"
          value={date}
          onChange={setDate}
          options={[
            { value: 'all', label: 'All time' },
            { value: 'today', label: 'Today' },
            { value: '7', label: 'Last 7 days' },
            { value: '30', label: 'Last 30 days' },
            { value: '90', label: 'Last 3 months' },
            { value: 'custom', label: 'Custom range' },
          ]}
        />
        <button
          type="button"
          onClick={() => downloadCsv(filtered)}
          className="ml-auto flex h-11 items-center gap-2 rounded-full bg-[#f5f5f5] px-4 text-sm font-medium text-[#1a1a1a] outline-none hover:bg-white"
        >
          <Download className="size-4" />
          Export CSV
        </button>
      </div>

      <DataTable
        tone="raised"
        columns={TX_COLUMNS}
        data={filtered}
        getRowId={(tx) => tx.id}
        onRowClick={setSelected}
        footer={
        TRANSACTIONS.length === 0 ? (
          <Empty className="border-0 py-16">
            <EmptyHeader>
              <EmptyMedia>
                <OrbsIllustration />
              </EmptyMedia>
              <EmptyTitle className="text-xl text-white">You don&apos;t have any transactions yet</EmptyTitle>
              <EmptyDescription>
                Your transactions will appear here when you receive money, make a payout, convert funds, or withdraw.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <PrimaryButton type="button" className="w-auto px-5" onClick={() => navigate({ to: '/balances' })}>
                <Plus className="size-4" />
                Receive money
              </PrimaryButton>
            </EmptyContent>
          </Empty>
        ) : filtered.length === 0 ? (
          <Empty className="border-0 py-16">
            <EmptyHeader>
              <EmptyMedia>
                <BookIllustration />
              </EmptyMedia>
              <EmptyTitle className="text-xl text-white">No results found</EmptyTitle>
              <EmptyDescription>
                We couldn&apos;t find any transactions matching your search.
                <br />
                Try a different keyword or clear your filters.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <button
                type="button"
                onClick={clear}
                className="h-10 rounded-full bg-[#2e2e2e] px-4 text-sm text-white outline-none hover:bg-[#3a3a3a]"
              >
                Clear filters
              </button>
            </EmptyContent>
          </Empty>
        ) : null
        }
      />

      <TransactionDetail
        tx={selected}
        onClose={() => setSelected(null)}
        onRecipients={() => navigate({ to: '/transactions/recipients' })}
      />
    </div>
  )
}

const txCol = createDataColumns<Tx>()

const TX_COLUMNS = txCol.columns([
  txCol.accessor('name', {
    header: 'Recipient',
    meta: { width: '23%' },
    cell: ({ row }) => (
      <span className="flex items-center gap-3">
        <Initials color={row.original.color}>{row.original.initials}</Initials>
        <span className="min-w-0 leading-tight">
          <span className="block truncate font-medium text-[#f5f5f5]">{row.original.name}</span>
          <span className="text-[13px] text-[#9a9a9a]">{row.original.note}</span>
        </span>
      </span>
    ),
  }),
  txCol.display({
    id: 'destination',
    header: 'Destination',
    meta: { width: '13%' },
    cell: ({ row }) => (
      <span className="flex items-center gap-1.5 text-[#d7d7d7]">
        <Flag mark={row.original.fromFlag} />
        <span>→</span>
        <Flag mark={row.original.toFlag} />
      </span>
    ),
  }),
  txCol.accessor('amount', { header: 'Amount', meta: { width: '16%', className: 'text-[#f3f3f3]' } }),
  txCol.accessor('fee', { header: 'Fee', meta: { width: '13%', className: 'text-[#d7d7d7]' } }),
  txCol.accessor('status', {
    header: 'Status',
    meta: { width: '15%' },
    cell: ({ row }) => <StatusBadge tone={row.original.tone}>{row.original.status}</StatusBadge>,
  }),
  txCol.accessor('date', { header: 'Date', meta: { className: 'text-[#d7d7d7]' } }),
])

function Flag({ mark }: { mark: string }) {
  if (mark === 'usdc') return <UsdcMark />
  return <span className="text-base leading-none">{mark}</span>
}

function downloadCsv(rows: Tx[]) {
  const header = 'Recipient,Amount,Fee,Status,Date,Type'
  const body = rows
    .map((tx) => [tx.name, tx.amount, tx.fee, tx.status, tx.date, tx.type].join(','))
    .join('\n')
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'coinmonie-transactions.csv'
  link.click()
  URL.revokeObjectURL(url)
}
