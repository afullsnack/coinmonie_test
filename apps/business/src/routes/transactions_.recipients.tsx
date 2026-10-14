import { requireSession } from '#/lib/session'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { FlowFrame, Initials, StatusBadge } from '#/components/money/chrome'
import { DataTable, createDataColumns } from '#/components/money/data-table'

export const Route = createFileRoute('/transactions_/recipients')({
  beforeLoad: requireSession,
  head: () => ({ meta: [{ title: 'Payout recipients · CoinMonie' }] }),
  component: RecipientsPage,
})

const ROWS = [
  {
    name: 'Ada Okafor',
    initials: 'AO',
    color: '#f0742e',
    bank: 'GTBank · 0123456789',
    bankColor: '#f0742e',
    amount: '₦850,000',
    tone: 'processing' as const,
    status: 'Processing',
    reason: 'Recipient bank issues',
    date: 'Aug 26, 2025 11:45 AM',
  },
  {
    name: 'Kwame Boateng',
    initials: 'KB',
    color: '#3b82f6',
    bank: 'Ecobank · 3426182214',
    bankColor: '#3b82f6',
    amount: '₦850,000',
    tone: 'successful' as const,
    status: 'Successful',
    reason: '—',
    date: 'Aug 26, 2025 11:45 AM',
  },
  {
    name: 'Amina Said',
    initials: 'AS',
    color: '#8b5cf6',
    bank: 'Access · 6722389031',
    bankColor: '#f4f7fa',
    amount: '₦850,000',
    tone: 'successful' as const,
    status: 'Successful',
    reason: '—',
    date: 'Aug 26, 2025 11:45 AM',
  },
]

const col = createDataColumns<(typeof ROWS)[number]>()

const COLUMNS = col.columns([
  col.accessor('name', {
    header: 'Recipient',
    meta: { width: '20%' },
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Initials color={row.original.color}>{row.original.initials}</Initials>
        <div>
          <p className="font-medium text-white">{row.original.name}</p>
          <p className="text-[13px] text-[#9a9a9a]">Payroll</p>
        </div>
      </div>
    ),
  }),
  col.accessor('bank', {
    header: 'Bank account',
    meta: { width: '22%' },
    cell: ({ row }) => (
      <span className="flex items-center gap-2 text-[#e8e8e8]">
        <span className="size-4 shrink-0 rounded-full" style={{ backgroundColor: row.original.bankColor }} />
        {row.original.bank}
      </span>
    ),
  }),
  col.accessor('amount', { header: 'Amount', meta: { width: '12%' } }),
  col.accessor('status', {
    header: 'Status',
    meta: { width: '13%' },
    cell: ({ row }) => <StatusBadge tone={row.original.tone}>{row.original.status}</StatusBadge>,
  }),
  col.accessor('reason', { header: 'Reason', meta: { width: '16%', className: 'text-[#d0d0d0]' } }),
  col.accessor('date', { header: 'Date', meta: { className: 'text-[#d0d0d0]' } }),
])

function RecipientsPage() {
  const navigate = useNavigate()
  return (
    <FlowFrame onBack={() => navigate({ to: '/transactions' })}>
      <h1 className="mt-10 text-[28px] font-semibold text-white">Payout recipients</h1>
      <DataTable
        tone="raised"
        className="mt-6"
        columns={COLUMNS}
        data={ROWS}
        getRowId={(row) => row.name}
      />
    </FlowFrame>
  )
}
