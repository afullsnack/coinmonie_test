import { useMemo } from 'react'
import { Pencil, UserRound } from 'lucide-react'

import { DataTable, createDataColumns } from '#/components/money/data-table'
import type { GroupMember } from '#/components/payouts/payout-context'

const BANK_COLORS: Record<string, string> = {
  GTBank: '#f0742e',
  Ecobank: '#2f7cc4',
  Access: '#e8eef2',
  Zenith: '#1b4ea8',
  'First Bank': '#2e6f4e',
}

export function BankDot({ bank }: { bank: string }) {
  const light = bank === 'Access'
  return (
    <span
      className="flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
      style={{
        backgroundColor: BANK_COLORS[bank] ?? '#4a4a4a',
        color: light ? '#1a1a1a' : '#ffffff',
      }}
    >
      {bank.charAt(0)}
    </span>
  )
}

function memberInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const col = createDataColumns<GroupMember>()

export function MemberTable({
  members,
  onEdit,
  onRemove,
  empty,
  className,
}: {
  members: GroupMember[]
  onEdit: (member: GroupMember) => void
  onRemove: (member: GroupMember) => void
  empty: React.ReactNode
  className?: string
}) {
  const columns = useMemo(
    () =>
      col.columns([
        col.accessor('name', {
          header: 'Recipient',
          meta: { width: '27%' },
          cell: ({ row }) => (
            <div className="flex items-center gap-3">
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white"
                style={{ backgroundColor: row.original.color }}
              >
                {memberInitials(row.original.name)}
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
          meta: { width: '30%' },
          cell: ({ row }) => (
            <div className="flex items-center gap-2">
              <BankDot bank={row.original.bank} />
              <span className="text-sm text-[#e6e6e6]">
                {row.original.bank} · {row.original.account}
              </span>
            </div>
          ),
        }),
        col.accessor('amount', { header: 'Amount', meta: { width: '22%' } }),
        col.display({
          id: 'actions',
          header: 'Actions',
          cell: ({ row }) => (
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => onEdit(row.original)}
                className="flex items-center gap-2 text-sm text-[#f5f5f5] outline-none hover:text-white"
              >
                <Pencil aria-hidden="true" className="size-4" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => onRemove(row.original)}
                className="flex items-center gap-2 text-sm text-[#f5f5f5] outline-none hover:text-white"
              >
                <UserRound aria-hidden="true" className="size-4" />
                Remove
              </button>
            </div>
          ),
        }),
      ]),
    [onEdit, onRemove],
  )

  return (
    <DataTable
      className={className}
      columns={columns}
      data={members}
      getRowId={(member) => member.id}
      footer={members.length === 0 ? empty : null}
    />
  )
}
