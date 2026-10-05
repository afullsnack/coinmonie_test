import { useEffect, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeftRight,
  ArrowUpRight,
  Download,
  Eye,
  Plus,
  RotateCw,
} from 'lucide-react'
import { cn } from 'cn'

import {
  BankBannerIllustration,
  BookIllustration,
} from '#/components/dashboard/illustrations'
import { PrimaryButton } from '#/components/auth/primary-button'
import { formatAmount } from '#/lib/format'
import { firstNameOf } from '#/lib/last-account'
import { DataTable, createDataColumns } from '#/components/money/data-table'
import { DestinationDialog } from '#/components/withdrawals/destination-dialog'

export const Route = createFileRoute('/_app/dashboard')({
  component: Dashboard,
})

type Mode = 'empty' | 'filled'
const MODE: Mode = 'filled'

interface Stat {
  label: string
  value: string
  eye: boolean
  sub: string
  subGreen?: boolean
}

const STATS: Record<Mode, Stat[]> = {
  filled: [
    {
      label: 'Total balance',
      value: `$${formatAmount(61_240)}`,
      eye: true,
      sub: 'Across 4 currencies',
    },
    {
      label: 'Volume · 30 days',
      value: `$${formatAmount(482_900)}`,
      eye: true,
      sub: '▲ 18% vs last month',
      subGreen: true,
    },
    {
      label: 'Pending payouts',
      value: '3',
      eye: false,
      sub: `$${formatAmount(4_120)} in flight`,
    },
    {
      label: 'Success rate',
      value: '99.4%',
      eye: false,
      sub: '▲ 0.3%',
      subGreen: true,
    },
  ],
  empty: [
    { label: 'Total balance', value: '0.00', eye: true, sub: '' },
    { label: 'Volume · 30 days', value: '0.00', eye: true, sub: '' },
    { label: 'Pending payouts', value: '0', eye: false, sub: '' },
    { label: 'Success rate', value: '-- %', eye: false, sub: '' },
  ],
}

const BALANCES = [
  {
    name: 'USDC stablecoin',
    amount: formatAmount(42_800, { decimals: 2 }),
    code: 'USDC',
    icon: <UsdcIcon />,
  },
  { name: 'Nigerian Naira', amount: formatAmount(18_450_000), code: 'NGN', icon: '🇳🇬' },
  { name: 'Ghana Cedi', amount: formatAmount(96_200), code: 'GHS', icon: '🇬🇭' },
  { name: 'Kenya Shilling', amount: formatAmount(1_240_000), code: 'KES', icon: '🇰🇪' },
]

const ACTIVITY = [
  {
    initials: 'AO',
    color: '#f0742e',
    name: 'Ada Okafor',
    note: 'Payroll',
    to: '🇳🇬',
    amount: `₦${formatAmount(850_000)}`,
    status: 'Processing',
    date: 'Aug 26, 2025 11:45 AM',
  },
  {
    initials: 'KB',
    color: '#3b82f6',
    name: 'Kwame Boateng',
    note: 'Payroll',
    to: '🇬🇭',
    amount: `GHS ${formatAmount(12_400)}`,
    status: 'Successful',
    date: 'Aug 26, 2025 11:45 AM',
  },
  {
    initials: 'AS',
    color: '#8b5cf6',
    name: 'Amina Said',
    note: 'Payroll',
    to: '🇰🇪',
    amount: `KES ${formatAmount(180_000)}`,
    status: 'Successful',
    date: 'Aug 26, 2025 11:45 AM',
  },
]

const activityCol = createDataColumns<(typeof ACTIVITY)[number]>()

const ACTIVITY_COLUMNS = activityCol.columns([
  activityCol.accessor('name', {
    header: 'Recipient',
    meta: { width: '26%' },
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white"
          style={{ backgroundColor: row.original.color }}
        >
          {row.original.initials}
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-medium text-[#f5f5f5]">{row.original.name}</p>
          <p className="truncate text-[13px] text-[#9a9a9a]">{row.original.note}</p>
        </div>
      </div>
    ),
  }),
  activityCol.accessor('to', {
    header: 'Destination',
    meta: { width: '17%' },
    cell: ({ getValue }) => (
      <div className="flex shrink-0 items-center gap-1">
        <UsdcIcon />
        <ArrowRight />
        <span className="text-base leading-none">{getValue()}</span>
      </div>
    ),
  }),
  activityCol.accessor('amount', { header: 'Amount', meta: { width: '16%' } }),
  activityCol.accessor('status', {
    header: 'Status',
    meta: { width: '17%' },
    cell: ({ getValue }) => <StatusPill status={getValue()} />,
  }),
  activityCol.accessor('date', { header: 'Date', meta: { className: 'text-[#9a9a9a]' } }),
])

const CHART = [30, 55, 18, 42, 35, 45, 38]
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const QUICK_ACTIONS = [
  { label: 'New payout', icon: ArrowUpRight, to: '/payouts/new' as const },
  { label: 'Receive money', icon: Plus, to: '/balances' as const },
  { label: 'Convert', icon: RotateCw, to: '/withdrawals/convert' as const },
  { label: 'Withdraw', icon: ArrowLeftRight, action: 'withdraw' as const },
]

const SKELETON = 'animate-pulse rounded-[12px] bg-[#232323]'

function UsdcIcon() {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#2775ca] text-[11px] font-bold text-white">
      $
    </span>
  )
}

function greeting(hour = new Date().getHours()) {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function Dashboard() {
  const navigate = useNavigate()
  const { session } = Route.useRouteContext()
  const [loading, setLoading] = useState(true)
  const [bankAdded, setBankAdded] = useState(MODE === 'filled')
  const [hidden, setHidden] = useState<Record<string, boolean>>({})
  const [destinationOpen, setDestinationOpen] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1200)
    return () => window.clearTimeout(timer)
  }, [])

  if (loading) return <DashboardSkeleton />

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="truncate text-lg font-semibold text-[#f5f5f5]">
          {greeting()}, {firstNameOf(session.user)}
        </h1>
        <button
          type="button"
          className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#f5f5f5] px-5 text-sm font-medium text-[#1a1a1a] transition-colors outline-none hover:bg-white"
        >
          <Download aria-hidden="true" className="size-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-[2px] sm:grid-cols-2 xl:grid-cols-4">
        {STATS[MODE].map((stat) => (
          <div
            key={stat.label}
            className="min-w-0 rounded-[12px] border border-[#262626] bg-[#191919] px-4 py-4"
          >
            <p className="truncate text-[13px] text-[#9a9a9a]">{stat.label}</p>
            <div className="mt-1 flex min-w-0 items-center gap-3">
              <span className="truncate text-[26px] leading-[1.1] font-semibold text-[#fafafa]">
                {stat.eye && hidden[stat.label] ? '••••••' : stat.value}
              </span>
              {stat.eye ? (
                <button
                  type="button"
                  aria-label={
                    hidden[stat.label]
                      ? `Show ${stat.label}`
                      : `Hide ${stat.label}`
                  }
                  onClick={() =>
                    setHidden((h) => ({ ...h, [stat.label]: !h[stat.label] }))
                  }
                  className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#2f2f2f] text-[#c9c9c9] outline-none hover:text-white"
                >
                  <Eye className="size-3.5" />
                </button>
              ) : null}
            </div>
            {stat.sub ? (
              <p
                className={cn(
                  'mt-1 truncate text-[13px]',
                  stat.subGreen ? 'text-[#30c463]' : 'text-[#9a9a9a]',
                )}
              >
                {stat.sub}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      {!bankAdded ? (
        <div className="relative overflow-hidden rounded-[16px] bg-[#2b4ed8] px-6 py-5">
          <div
            aria-hidden="true"
            className="absolute top-0 right-[220px] h-full w-[140px] -skew-x-12 bg-white/10"
          />
          <div className="relative flex flex-wrap items-center gap-4">
            <BankBannerIllustration />
            <div className="min-w-[220px] flex-1">
              <p className="text-lg font-bold text-white">Add a bank account</p>
              <p className="mt-[2px] text-sm text-[#c9d4f7]">
                Add your business bank account to receive payouts from
                CoinMonie.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setBankAdded(true)
                navigate({ to: '/add-bank-account' })
              }}
              className="flex h-11 shrink-0 items-center gap-2 rounded-[10px] bg-white px-5 text-sm font-medium text-[#1a1a1a] transition-colors outline-none hover:bg-[#ececec]"
            >
              <Plus aria-hidden="true" className="size-4" />
              Add bank account
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.05fr]">
        <section className="min-w-0 rounded-[16px] border border-[#262626] bg-[#191919] p-4">
          <p className="text-sm text-[#9a9a9a]">Quick actions</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((action) => (
              <QuickActionButton
                key={action.label}
                {...action}
                onWithdraw={() => setDestinationOpen(true)}
              />
            ))}
          </div>
        </section>

        <section className="min-w-0 rounded-[16px] border border-[#262626] bg-[#191919] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#9a9a9a]">Payment volume</p>
            <button
              type="button"
              className="flex items-center gap-1 text-sm text-[#9a9a9a] outline-none hover:text-[#e6e6e6]"
            >
              Last 7 days
              <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4">
                <path
                  d="M4 6 L8 10 L12 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div className="mt-4 flex h-[104px] items-end justify-between px-2">
            {CHART.map((height, i) => (
              <div key={DAYS[i]} className="flex flex-col items-center gap-2">
                <span
                  className="w-3 rounded-t bg-gradient-to-b from-[#8a8a92] to-[#3a3a40]"
                  style={{ height: MODE === 'filled' ? height : 0 }}
                />
                <span className="text-xs text-[#8a8a8a]">{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {MODE === 'filled' ? (
        <section>
          <p className="text-[15px] text-[#e6e6e6]">Balances</p>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {BALANCES.map((balance) => (
              <div
                key={balance.code}
                className="min-w-0 rounded-[12px] bg-[#212121] px-4 py-3"
              >
                <p className="truncate text-[13px] text-[#9a9a9a]">{balance.name}</p>
                <div className="mt-[6px] flex min-w-0 items-center gap-2">
                  <span className="shrink-0">{balance.icon}</span>
                  <span className="truncate text-lg font-semibold text-[#fafafa]">
                    {hidden[balance.code] ? '••••••' : balance.amount}
                  </span>
                  <span className="shrink-0 text-sm text-[#8a8a8a]">{balance.code}</span>
                  <button
                    type="button"
                    aria-label={`Hide ${balance.code} balance`}
                    onClick={() =>
                      setHidden((h) => ({
                        ...h,
                        [balance.code]: !h[balance.code],
                      }))
                    }
                    className="ml-auto shrink-0 text-[#8a8a8a] outline-none hover:text-white"
                  >
                    <Eye className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="min-w-0">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[15px] font-medium text-[#f5f5f5]">
            Recent activity
          </p>
          <Link
            to="/transactions"
            className="flex shrink-0 items-center gap-1 text-sm text-[#9a9a9a] outline-none hover:text-[#e6e6e6] focus-visible:text-[#e6e6e6]"
          >
            View all
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        {ACTIVITY.length === 0 || MODE === 'empty' ? (
          <div className="flex flex-col items-center py-10 text-center">
            <BookIllustration />
            <p className="mt-[16px] text-xl font-semibold text-[#fafafa]">
              You don't have any transactions yet
            </p>
            <p className="mt-[6px] text-sm text-[#9a9a9a]">
              Your recent transaction history will show here.
            </p>
          </div>
        ) : (
          <DataTable
            className="mt-3"
            minWidth={820}
            columns={ACTIVITY_COLUMNS}
            data={ACTIVITY}
            getRowId={(tx) => tx.name}
          />
        )}
      </section>
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

function ArrowRight() {
  return (
    <svg
      viewBox="0 0 24 12"
      aria-hidden="true"
      className="mx-[2px] h-3 w-6 text-[#6b6b6b]"
    >
      <path
        d="M2 6 H18 M15 2.5 L18.5 6 L15 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function StatusPill({ status }: { status: string }) {
  const success = status === 'Successful'
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center rounded-full px-3 text-[13px] font-medium whitespace-nowrap',
        success
          ? 'bg-[#30c463]/12 text-[#30c463]'
          : 'bg-[#f3b13b]/12 text-[#f3b13b]',
      )}
    >
      {status}
    </span>
  )
}

function QuickActionButton({
  label,
  icon: Icon,
  to,
  action,
  onWithdraw,
}: {
  label: string
  icon: React.ComponentType<{ className?: string }>
  to?: '/payouts/new' | '/balances' | '/withdrawals/convert'
  action?: 'withdraw'
  onWithdraw?: () => void
}) {
  const navigate = useNavigate()
  const className =
    'flex h-12 min-w-0 items-center justify-center gap-2 rounded-[10px] bg-[#242424] px-3 text-[15px] text-[#f5f5f5] outline-none transition-colors hover:bg-[#2b2b2b]'
  return (
    <button
      type="button"
      onClick={() => {
        if (action === 'withdraw') onWithdraw?.()
        else if (to) navigate({ to })
      }}
      className={className}
    >
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className={cn(SKELETON, 'h-5 w-[180px] rounded-full')} />
        <PrimaryButton type="button" className="pointer-events-none">
          <Plus aria-hidden="true" className="size-4" />
          New payout
        </PrimaryButton>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={cn(SKELETON, 'h-[120px]')} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.05fr]">
        <div className={cn(SKELETON, 'h-[200px]')} />
        <div className={cn(SKELETON, 'h-[200px]')} />
      </div>
      <div className={cn(SKELETON, 'h-2 w-[180px] rounded-full')} />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={cn(SKELETON, 'h-[100px]')} />
        ))}
      </div>
      <div className={cn(SKELETON, 'h-2 w-[180px] rounded-full')} />
      <div className={cn(SKELETON, 'h-12 w-full')} />
      <div className="flex flex-col gap-5 px-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="grid grid-cols-5 gap-6">
            {Array.from({ length: 5 }, (__, j) => (
              <div key={j} className={cn(SKELETON, 'h-2 rounded-full')} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
