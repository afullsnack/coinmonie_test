import { useMemo, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowUpRight, Eye, Minus, Plus, RotateCw } from 'lucide-react'
import { cn } from 'cn'
import { z } from 'zod'

import { OrbsIllustration } from '#/components/dashboard/illustrations'
import { DataTable, createDataColumns } from '#/components/money/data-table'
import { Flag } from '#/components/money/flag'
import { Separator } from '#/components/ui/separator'
import { ReceiveSheet, FundsAddedModal } from '#/components/withdrawals/receive-sheet'
import { DestinationDialog } from '#/components/withdrawals/destination-dialog'

export const Route = createFileRoute('/_app/balances')({
  validateSearch: z.object({ empty: z.boolean().optional() }),
  head: () => ({ meta: [{ title: 'Balances · CoinMonie' }] }),
  component: Balances,
})

const TABS = ['All', 'Stablecoins', 'Fiat'] as const
type Tab = (typeof TABS)[number]

type BalanceRow = (typeof ROWS)[number]
const col = createDataColumns<BalanceRow>()

const ROWS = [
  { id: 'usdc', name: 'USDC', country: 'Stablecoin', flag: null, available: '42,800.00', usd: '$42,800', kind: 'stablecoin' as const },
  { id: 'naira', name: 'Naira', country: 'Nigeria', flag: 'NG', available: '18,450,000', usd: '$11,300', kind: 'fiat' as const },
  { id: 'cedi', name: 'Cedi', country: 'Ghana', flag: 'GH', available: '96,200', usd: '$6,180', kind: 'fiat' as const },
  { id: 'shilling', name: 'Shilling', country: 'Kenya', flag: 'KE', available: '1,240,000', usd: '$960', kind: 'fiat' as const },
]

function UsdcMark() {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#2775ca] text-[12px] font-bold text-white ring-2 ring-[#2775ca]/30">
      $
    </span>
  )
}

function Balances() {
  const navigate = useNavigate()
  const { empty } = Route.useSearch()
  const [tab, setTab] = useState<Tab>('All')
  const [hidden, setHidden] = useState(false)
  const [receiveOpen, setReceiveOpen] = useState(false)
  const [fundsAdded, setFundsAdded] = useState(false)
  const [destinationOpen, setDestinationOpen] = useState(false)

  const rows = useMemo(
    () => {
      if (empty) return []
      return tab === 'All' ? ROWS : ROWS.filter((row) => row.kind === (tab === 'Stablecoins' ? 'stablecoin' : 'fiat'))
    },
    [empty, tab],
  )

  const columns = useMemo(
    () =>
      col.columns([
        col.accessor('name', {
          header: 'Currency',
          meta: { width: '22%' },
          cell: ({ row }) => (
            <div className="flex min-w-0 items-center gap-3">
              {row.original.flag ? <Flag code={row.original.flag} className="size-7" /> : <UsdcMark />}
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-medium text-[#f5f5f5]">{row.original.name}</p>
                <p className="truncate text-[13px] text-[#9a9a9a]">{row.original.country}</p>
              </div>
            </div>
          ),
        }),
        col.accessor('available', { header: 'Available', meta: { width: '20%' } }),
        col.accessor('usd', { header: 'USD equivalence', meta: { width: '20%' } }),
        col.display({
          id: 'actions',
          header: 'Actions',
          meta: { width: '38%' },
          cell: () => (
            <div className="flex items-center text-sm text-[#e6e6e6]">
              <ActionButton icon={ArrowUpRight} label="Send" onClick={() => navigate({ to: '/payouts/new' })} />
              <Separator orientation="vertical" className="mx-3 h-5 bg-[#2f2f2f]" />
              <ActionButton icon={Plus} label="Add funds" onClick={() => setReceiveOpen(true)} />
              <Separator orientation="vertical" className="mx-3 h-5 bg-[#2f2f2f]" />
              <ActionButton icon={RotateCw} label="Convert" onClick={() => navigate({ to: '/withdrawals/convert' })} />
              <Separator orientation="vertical" className="mx-3 h-5 bg-[#2f2f2f]" />
              <ActionButton icon={Minus} label="Withdraw" onClick={() => setDestinationOpen(true)} />
            </div>
          ),
        }),
      ]),
    [navigate],
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[16px] border border-[#262626] bg-[#191919] px-6 py-5">
        <div className="min-w-0">
          <p className="text-[13px] text-[#9a9a9a]">Total balance</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="truncate text-[28px] leading-[1.1] font-semibold text-[#fafafa]">
              {hidden ? '••••••' : empty ? '$0.00' : '$61,240.00'}
            </span>
            <button
              type="button"
              aria-label={hidden ? 'Show total balance' : 'Hide total balance'}
              onClick={() => setHidden((v) => !v)}
              className="flex size-6 items-center justify-center rounded-full bg-[#2f2f2f] text-[#c9c9c9] outline-none hover:text-white"
            >
              <Eye className="size-3.5" />
            </button>
          </div>
          {empty ? null : (
            <p className="mt-1 text-[13px]">
              <span className="text-[#9a9a9a]">Across 4 currencies · </span>
              <span className="text-[#30c463]">▲ 18% this month</span>
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-[2px]">
          <button
            type="button"
            onClick={() => navigate({ to: '/withdrawals/convert' })}
            className="flex h-11 items-center gap-2 rounded-l-[10px] bg-[#242424] px-5 text-sm text-[#f5f5f5] outline-none transition-colors hover:bg-[#2b2b2b]"
          >
            <RotateCw aria-hidden="true" className="size-4" />
            Convert
          </button>
          <button
            type="button"
            onClick={() => setReceiveOpen(true)}
            className="flex h-11 items-center gap-2 rounded-r-[10px] bg-[#242424] px-5 text-sm text-[#f5f5f5] outline-none transition-colors hover:bg-[#2b2b2b]"
          >
            <Plus aria-hidden="true" className="size-4" />
            Add funds
          </button>
        </div>
      </div>

      <div className="flex gap-[2px]">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'h-11 flex-1 rounded-[10px] text-sm font-medium outline-none transition-colors',
              t === tab ? 'bg-[#3a3a3a] text-[#f5f5f5]' : 'bg-[#232323] text-[#d0d0d0] hover:text-white',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <OrbsIllustration />
          <p className="mt-[16px] text-xl font-semibold text-[#fafafa]">
            You don't have any balance yet
          </p>
          <p className="mt-[6px] text-sm text-[#9a9a9a]">
            Add money or receive a payment to get started.
          </p>
          <button
            type="button"
            onClick={() => setReceiveOpen(true)}
            className="mt-4 flex h-9 items-center gap-1.5 rounded-full bg-[#f2f2f2] px-4 text-sm font-medium text-[#1a1a1a] outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <Plus aria-hidden="true" className="size-4" />
            Add funds
          </button>
        </div>
      ) : (
        <DataTable columns={columns} data={rows} getRowId={(row) => row.id} minWidth={900} />
      )}

      <ReceiveSheet
        open={receiveOpen}
        onClose={() => setReceiveOpen(false)}
        onFundsAdded={() => {
          setReceiveOpen(false)
          setFundsAdded(true)
        }}
      />
      {fundsAdded ? (
        <FundsAddedModal
          onClose={() => setFundsAdded(false)}
          onView={() => {
            setFundsAdded(false)
            navigate({ to: '/transactions' })
          }}
        />
      ) : null}
      <DestinationDialog
        open={destinationOpen}
        onOpenChange={setDestinationOpen}
        onContinue={(account, added) =>
          navigate({
            to: '/withdrawals/withdraw',
            search: {
              account: account.id,
              name: account.name,
              bank: account.bank,
              masked: account.masked,
              color: account.color,
              added,
            },
          })
        }
      />
    </div>
  )
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center gap-1.5 whitespace-nowrap outline-none hover:text-white focus-visible:text-white"
    >
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      {label}
    </button>
  )
}
