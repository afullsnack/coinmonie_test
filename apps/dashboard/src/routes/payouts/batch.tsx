import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

import { DataTable, createDataColumns } from '#/components/money/data-table'
import { StatusPill } from '#/routes/_app/dashboard'

export const BATCH_ROWS = [
  {
    initials: 'AO',
    color: '#f0742e',
    name: 'Ada Okafor',
    note: 'Payroll',
    bank: 'GTBank',
    bankColor: '#f0742e',
    account: '0123456789',
    amount: '₦850,000',
    status: 'Processing',
  },
  {
    initials: 'KB',
    color: '#3b82f6',
    name: 'Kwame Boateng',
    note: 'Payroll',
    bank: 'Ecobank',
    bankColor: '#2f7cc4',
    account: '3426182214',
    amount: 'GHS 12,400',
    status: 'Successful',
  },
  {
    initials: 'AS',
    color: '#8b5cf6',
    name: 'Amina Said',
    note: 'Payroll',
    bank: 'Access',
    bankColor: '#e8eef2',
    account: '6722389031',
    amount: 'KES 180,000',
    status: 'Successful',
  },
]

const col = createDataColumns<(typeof BATCH_ROWS)[number]>()

const COLUMNS = col.columns([
  col.accessor('name', {
    header: 'Recipient',
    meta: { width: '29%' },
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white"
          style={{ backgroundColor: row.original.color }}
        >
          {row.original.initials}
        </span>
        <div className="leading-tight">
          <p className="text-sm font-medium text-[#f5f5f5]">{row.original.name}</p>
          <p className="text-[13px] text-[#9a9a9a]">{row.original.note}</p>
        </div>
      </div>
    ),
  }),
  col.accessor('account', {
    header: 'Bank account',
    meta: { width: '31%' },
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span
          className="flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
          style={{ backgroundColor: row.original.bankColor }}
        >
          {row.original.bank.charAt(0)}
        </span>
        <span className="text-sm text-[#e6e6e6]">
          {row.original.bank} · {row.original.account}
        </span>
      </div>
    ),
  }),
  col.accessor('amount', { header: 'Amount', meta: { width: '22%' } }),
  col.accessor('status', {
    header: 'Status',
    cell: ({ getValue }) => <StatusPill status={getValue()} />,
  }),
])

export const Route = createFileRoute('/payouts/batch')({
  head: () => ({ meta: [{ title: 'Batch details · CoinMonie' }] }),
  component: BatchDetails,
})

function BatchDetails() {
  return (
    <main className="mx-auto w-[1000px] max-w-[calc(100%-48px)] pt-[58px] pb-16">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
          Batch details
        </h1>
        <button
          type="button"
          className="flex items-center gap-2 text-sm text-[#f5f5f5] outline-none hover:text-white"
        >
          <Plus aria-hidden="true" className="size-4" />
          Save as payout group
        </button>
      </div>
      <div className="mt-[16px] h-px bg-[#2b2b2b]" />

      <DataTable
        className="mt-[20px]"
        columns={COLUMNS}
        data={BATCH_ROWS}
        getRowId={(row) => row.name}
      />
    </main>
  )
}
