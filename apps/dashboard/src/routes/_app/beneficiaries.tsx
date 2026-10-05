import { useMemo, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChevronRight, Pencil, Plus, Users, Wallet, X } from 'lucide-react'
import { z } from 'zod'

import {
  BeneficiarySheet,
  type BeneficiaryDraft,
} from '#/components/beneficiaries/beneficiary-sheet'
import { BookIllustration, OrbsIllustration } from '#/components/dashboard/illustrations'
import { FilterMenu, Initials, SavedToast, SearchField, StatusBadge } from '#/components/money/chrome'
import { DataTable, createDataColumns } from '#/components/money/data-table'
import { Flag } from '#/components/money/flag'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '#/components/ui/dialog'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'

export const Route = createFileRoute('/_app/beneficiaries')({
  validateSearch: z.object({ empty: z.boolean().optional() }),
  head: () => ({ meta: [{ title: 'Beneficiaries · CoinMonie' }] }),
  component: BeneficiariesPage,
})

const SEED: BeneficiaryDraft[] = [
  {
    id: 'ada',
    name: 'Ada Okafor',
    initials: 'AO',
    color: '#f0742e',
    kind: 'individual',
    rail: 'bank',
    bank: 'GTBank',
    account: '0123456789',
    country: 'Nigeria',
    flag: '🇳🇬',
    currency: 'NGN',
    status: 'Pending',
    lastPaid: 'Aug 26, 2025 11:45 AM',
  },
  {
    id: 'kwame',
    name: 'Kwame Boateng',
    initials: 'KB',
    color: '#3b82f6',
    kind: 'individual',
    rail: 'bank',
    bank: 'Ecobank',
    account: '3426182214',
    country: 'Ghana',
    flag: '🇬🇭',
    currency: 'GHS',
    status: 'Verified',
    lastPaid: 'Aug 26, 2025 11:45 AM',
  },
  {
    id: 'amina',
    name: 'Amina Said',
    initials: 'AS',
    color: '#8b5cf6',
    kind: 'individual',
    rail: 'bank',
    bank: 'Access',
    account: '6722389031',
    country: 'Kenya',
    flag: '🇰🇪',
    currency: 'KES',
    status: 'Verified',
    lastPaid: 'Aug 26, 2025 11:45 AM',
  },
  {
    id: 'nasai',
    name: 'NASAI Staff',
    initials: 'NS',
    color: '#7c5cff',
    kind: 'group',
    rail: 'bank',
    bank: 'Multiple',
    account: '',
    country: 'Nigeria',
    flag: '🇳🇬',
    currency: 'KES',
    status: 'Verified',
    lastPaid: 'Aug 26, 2025 11:45 AM',
  },
]

const GROUP_DOTS = ['#f0742e', '#3b82f6', '#8b5cf6', '#f4f7fa', '#f0c14b']
const col = createDataColumns<BeneficiaryDraft>()

function BeneficiariesPage() {
  const navigate = useNavigate()
  const { empty } = Route.useSearch()
  const [rows, setRows] = useState(empty ? [] : SEED)
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState('all')
  const [country, setCountry] = useState('all')
  const [status, setStatus] = useState('all')
  const [rail, setRail] = useState('all')
  const [kindOpen, setKindOpen] = useState(false)
  const [sheet, setSheet] = useState<null | { mode: 'add' | 'edit'; row?: BeneficiaryDraft }>(null)
  const [toast, setToast] = useState(false)

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const haystack = `${row.name} ${row.bank} ${row.account} ${row.country}`.toLowerCase()
      if (query && !haystack.includes(query.trim().toLowerCase())) return false
      if (kind === 'individual' && row.kind !== 'individual') return false
      if (kind === 'group' && row.kind !== 'group') return false
      if (country !== 'all' && row.country !== country) return false
      if (status !== 'all' && row.status !== status) return false
      if (rail === 'bank' && row.rail !== 'bank') return false
      if (rail === 'wallet' && row.rail !== 'wallet') return false
      return true
    })
  }, [country, kind, query, rail, rows, status])

  const columns = useMemo(
    () =>
      col.columns([
        col.accessor('name', {
          header: 'Beneficiary',
          meta: { width: '18%' },
          cell: ({ row }) => (
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative shrink-0">
                <Initials color={row.original.color}>{row.original.initials}</Initials>
                {row.original.kind === 'group' ? (
                  <span className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full bg-[#3a3a3a] ring-2 ring-[#141414]">
                    <Users aria-hidden="true" className="size-2.5 text-[#e8e8e8]" />
                  </span>
                ) : null}
              </span>
              <div className="min-w-0 leading-tight">
                <p className="truncate font-medium text-[#f5f5f5]">{row.original.name}</p>
                <p className="truncate text-[13px] text-[#9a9a9a]">
                  {row.original.kind === 'group' ? 'Payout group' : 'Payroll'}
                </p>
              </div>
            </div>
          ),
        }),
        col.accessor('account', {
          header: 'Bank account',
          meta: { width: '18%' },
          cell: ({ row }) => (
            <div className="flex items-center gap-2 text-[#e8e8e8]">
              {row.original.kind === 'group' ? (
                <span className="flex gap-1">
                  {GROUP_DOTS.map((color) => (
                    <span key={color} className="size-4 rounded-full" style={{ backgroundColor: color }} />
                  ))}
                </span>
              ) : (
                <>
                  <span className="size-4 shrink-0 rounded-full" style={{ backgroundColor: row.original.color }} />
                  <span className="truncate">
                    {row.original.bank} · {row.original.account}
                  </span>
                </>
              )}
            </div>
          ),
        }),
        col.accessor('country', {
          header: 'Country',
          meta: { width: '12%' },
          cell: ({ row }) => (
            <span className="flex min-w-0 items-center gap-2 text-[#e8e8e8]">
              <Flag code={row.original.flag} className="size-4" />
              <span className="truncate">{row.original.country}</span>
            </span>
          ),
        }),
        col.accessor('currency', { header: 'Currency', meta: { width: '8%' } }),
        col.accessor('status', {
          header: 'Status',
          meta: { width: '10%' },
          cell: ({ getValue }) => (
            <StatusBadge tone={getValue() === 'Verified' ? 'successful' : 'processing'}>
              {getValue()}
            </StatusBadge>
          ),
        }),
        col.accessor('lastPaid', { header: 'Last paid', meta: { width: '18%', className: 'text-[#d7d7d7]' } }),
        col.display({
          id: 'actions',
          header: 'Actions',
          cell: ({ row }) => (
            <div className="flex items-center gap-3 text-[#e8e8e8]">
              <button
                type="button"
                onClick={() => navigate({ to: '/payouts/new' })}
                className="flex items-center gap-1 outline-none hover:text-white"
              >
                <Wallet className="size-4" />
                Pay
              </button>
              <button
                type="button"
                onClick={() => setSheet({ mode: 'edit', row: row.original })}
                className="flex items-center gap-1 outline-none hover:text-white"
              >
                <Pencil className="size-4" />
                Edit
              </button>
            </div>
          ),
        }),
      ]),
    [navigate],
  )

  return (
    <div className="flex flex-col gap-4">
      {toast ? (
        <div className="flex justify-center">
          <SavedToast onClose={() => setToast(false)}>
            Your beneficiary changes have been saved.
          </SavedToast>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search beneficiaries..."
          className="min-w-[200px] flex-[0_1_300px]"
        />
        <FilterMenu
          idleLabel="Individual"
          value={kind}
          onChange={setKind}
          options={[
            { value: 'all', label: 'All' },
            { value: 'individual', label: 'Individual' },
            { value: 'group', label: 'Payout group' },
          ]}
        />
        <FilterMenu
          idleLabel="Country"
          value={country}
          onChange={setCountry}
          options={[
            { value: 'all', label: 'All countries' },
            ...(
              [
                ['Nigeria', 'NG'],
                ['Ghana', 'GH'],
                ['Kenya', 'KE'],
                ['South Africa', 'ZA'],
              ] as const
            ).map(([name, code]) => ({
              value: name,
              label: name,
              node: (
                <span className="flex items-center gap-2">
                  <Flag code={code} className="size-4" />
                  {name}
                </span>
              ),
            })),
          ]}
        />
        <FilterMenu
          idleLabel="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: 'All' },
            { value: 'Pending', label: 'Pending' },
            { value: 'Verified', label: 'Verified' },
          ]}
        />
        <FilterMenu
          idleLabel="Type"
          value={rail}
          onChange={setRail}
          options={[
            { value: 'all', label: 'All types' },
            { value: 'bank', label: 'Bank account' },
            { value: 'wallet', label: 'Wallet address' },
          ]}
        />
        <button
          type="button"
          onClick={() => setKindOpen(true)}
          className="ml-auto flex h-11 items-center gap-2 rounded-full bg-[#f5f5f5] px-4 text-sm font-medium text-[#1a1a1a] outline-none hover:bg-white"
        >
          <Plus className="size-4" />
          Add beneficiary
        </button>
      </div>

      <DataTable
        tone="raised"
        minWidth={1080}
        columns={columns}
        data={filtered}
        getRowId={(row) => row.id}
        footer={
        rows.length === 0 ? (
          <Empty className="border-0 py-16">
            <EmptyHeader>
              <EmptyMedia>
                <OrbsIllustration />
              </EmptyMedia>
              <EmptyTitle className="text-xl text-white">You don&apos;t have any beneficiary yet</EmptyTitle>
              <EmptyDescription>
                Add a beneficiary to make sending money faster and easier.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <button
                type="button"
                onClick={() => setKindOpen(true)}
                className="flex h-9 items-center gap-1.5 rounded-full bg-[#f2f2f2] px-4 text-sm font-medium text-[#1a1a1a] outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <Plus aria-hidden="true" className="size-4" />
                Add beneficiary
              </button>
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
                We couldn&apos;t find any beneficiaries matching your search.
                <br />
                Try a different keyword or clear your filters.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setKind('all')
                  setCountry('all')
                  setStatus('all')
                  setRail('all')
                }}
                className="h-10 rounded-full bg-[#2e2e2e] px-4 text-sm text-white outline-none hover:bg-[#3a3a3a]"
              >
                Clear filters
              </button>
            </EmptyContent>
          </Empty>
        ) : null
        }
      />
      <Dialog open={kindOpen} onOpenChange={setKindOpen}>
        <DialogContent
          showCloseButton={false}
          overlayClassName="bg-black/60 backdrop-blur-md"
          className="w-[440px] gap-3 rounded-[22px] bg-[#2a2a2a] p-5 ring-0 sm:max-w-[440px]"
        >
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg text-white">What kind of beneficiary</DialogTitle>
            <button type="button" aria-label="Close" onClick={() => setKindOpen(false)} className="text-white outline-none">
              <X className="size-5" />
            </button>
          </div>
          <Choice
            icon={Users}
            label="Individual beneficiary"
            onClick={() => {
              setKindOpen(false)
              setSheet({ mode: 'add' })
            }}
          />
          <Choice
            icon={Users}
            label="Payout group"
            onClick={() => {
              setKindOpen(false)
              navigate({ to: '/payouts/groups/create' })
            }}
          />
        </DialogContent>
      </Dialog>

      <BeneficiarySheet
        key={sheet?.row?.id ?? 'new'}
        open={sheet !== null}
        mode={sheet?.mode ?? 'add'}
        initial={sheet?.row}
        onOpenChange={(open) => {
          if (!open) setSheet(null)
        }}
        onSave={(beneficiary) => {
          setRows((current) => {
            const index = current.findIndex((row) => row.id === beneficiary.id)
            if (index === -1) return [beneficiary, ...current]
            const next = [...current]
            next[index] = beneficiary
            return next
          })
          if (sheet?.mode === 'edit') setToast(true)
        }}
      />
    </div>
  )
}

function Choice({
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
      className="flex h-12 w-full items-center gap-3 rounded-[12px] bg-[#232323] px-4 text-sm text-white outline-none hover:bg-[#303030]"
    >
      <Icon className="size-4 text-[#d0d0d0]" />
      <span className="flex-1 text-left">{label}</span>
      <ChevronRight className="size-4 text-[#9a9a9a]" />
    </button>
  )
}
