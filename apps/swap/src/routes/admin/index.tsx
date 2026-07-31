import { useEffect, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  adminListQueryOptions,
  adminStatsQueryOptions,
  adminTransactionsQueryOptions,
  adminWaitlistQueryOptions,
  adminWebhookConfigQueryOptions,
  adminWebhookEventsQueryOptions,
  developerFeeSettingsQueryOptions,
  transactionLimitSettingsQueryOptions,
  updateDeveloperFeeSettingsMutationOptions,
  updateTransactionLimitSettingsMutationOptions,
} from '#/lib/api-client'
import { authClient } from '#/lib/auth-client'
import { getExplorerUrl } from '#/lib/explorer'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { Switch } from '#/components/ui/switch'
import { Input } from '#/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '#/components/ui/input-group'
import { ExternalLink, SearchIcon } from 'lucide-react'
import { toast } from 'sonner'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '#/components/ui/drawer'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
})

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-4 bg-card border border-border">
      <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
      <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === 'COMPLETED'
      ? 'bg-green-600/15 text-green-600 dark:text-green-400 border-transparent'
      : status === 'FAILED'
        ? 'bg-destructive/15 text-destructive border-transparent'
        : status === 'AWAITING_DEPOSIT' || status === 'PENDING' || status === 'PROCESSING'
          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-transparent'
          : ''
  return (
    <Badge variant="outline" className={className}>
      {status.replaceAll('_', ' ')}
    </Badge>
  )
}

function CopyableText({ value, truncate }: { value: string; truncate?: boolean }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        navigator.clipboard.writeText(value)
        toast.success('Copied')
      }}
      className={`font-mono text-xs hover:text-accent transition-colors text-left ${truncate ? 'max-w-35 truncate block' : ''}`}
    >
      {value}
    </button>
  )
}

function WebhookEventsList({ reference }: { reference: string }) {
  const events = useQuery(adminWebhookEventsQueryOptions(reference))

  if (events.isLoading) {
    return <p className="text-muted-foreground">Loading webhook events...</p>
  }
  if (!events.data || events.data.length === 0) {
    return <p className="text-muted-foreground">No webhook events received yet.</p>
  }

  return (
    <div className="grid gap-2">
      {events.data.map((event) => (
        <div key={event.id} className="rounded-xl border border-border p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase">{event.eventType}</span>
            <Badge variant={event.signatureValid ? 'default' : 'outline'} className={event.signatureValid ? 'bg-accent text-accent-foreground' : 'text-destructive'}>
              {event.signatureValid ? 'Verified' : 'Invalid signature'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(event.receivedAt).toLocaleString()}
          </p>
          {event.transactionHash && (
            <div className="mt-1">
              <span className="text-xs text-muted-foreground mr-1">Hash:</span>
              <CopyableText value={event.transactionHash} truncate />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function DeveloperFeeCard({ canManage }: { canManage: boolean }) {
  const queryClient = useQueryClient()
  const settings = useQuery(developerFeeSettingsQueryOptions)
  const [enabled, setEnabled] = useState(false)
  const [percent, setPercent] = useState('0')

  useEffect(() => {
    if (settings.data) {
      setEnabled(settings.data.enabled)
      setPercent(String(settings.data.percent))
    }
  }, [settings.data])

  const update = useMutation({
    ...updateDeveloperFeeSettingsMutationOptions,
    onSuccess: () => {
      toast.success('Developer fee updated')
      queryClient.invalidateQueries({ queryKey: ['admin', 'developerFeeSettings'] })
    },
  })

  const hasChanges = settings.data
    && (enabled !== settings.data.enabled || Number(percent) !== settings.data.percent)

  return (
    <div className="rounded-xl p-4 bg-card border border-border md:col-span-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Developer fee</p>
        {!canManage && (
          <span className="text-xs text-muted-foreground">Read only</span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Switch checked={enabled} onCheckedChange={setEnabled} disabled={!canManage} />
        <span className="text-sm text-foreground">{enabled ? 'Enabled' : 'Disabled'}</span>
      </div>

      <div className="mt-3 flex items-center gap-2 max-w-xs">
        <Input
          type="number"
          min={0}
          max={100}
          step="0.1"
          value={percent}
          onChange={(e) => setPercent(e.target.value)}
          disabled={!canManage}
          className="rounded-xl"
        />
        <span className="text-sm text-muted-foreground">%</span>
      </div>

      {canManage && (
        <Button
          size="sm"
          className="mt-3 rounded-xl bg-accent text-accent-foreground"
          disabled={!hasChanges || update.isPending}
          onClick={() => update.mutate({ enabled, percent: Number(percent) })}
        >
          {update.isPending ? 'Saving...' : 'Save changes'}
        </Button>
      )}

      <p className="mt-2 text-xs text-muted-foreground">
        Applied to Switch quotes and transfers when enabled. Takes effect immediately, no redeploy needed.
      </p>
    </div>
  )
}

function TransactionLimitCard({ canManage }: { canManage: boolean }) {
  const queryClient = useQueryClient()
  const settings = useQuery(transactionLimitSettingsQueryOptions)
  const [enabled, setEnabled] = useState(true)
  const [limitUsd, setLimitUsd] = useState('1000')

  useEffect(() => {
    if (settings.data) {
      setEnabled(settings.data.enabled)
      setLimitUsd(String(settings.data.limitUsd))
    }
  }, [settings.data])

  const update = useMutation({
    ...updateTransactionLimitSettingsMutationOptions,
    onSuccess: () => {
      toast.success('Transaction limit updated')
      queryClient.invalidateQueries({ queryKey: ['admin', 'transactionLimitSettings'] })
    },
  })

  const hasChanges = settings.data
    && (enabled !== settings.data.enabled || Number(limitUsd) !== settings.data.limitUsd)

  return (
    <div className="rounded-xl p-4 bg-card border border-border md:col-span-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Transaction limit</p>
        {!canManage && (
          <span className="text-xs text-muted-foreground">Read only</span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Switch checked={enabled} onCheckedChange={setEnabled} disabled={!canManage} />
        <span className="text-sm text-foreground">{enabled ? 'Enabled' : 'Disabled'}</span>
      </div>

      <div className="mt-3 flex items-center gap-2 max-w-xs">
        <span className="text-sm text-muted-foreground">$</span>
        <Input
          type="number"
          min={0}
          step="1"
          value={limitUsd}
          onChange={(e) => setLimitUsd(e.target.value)}
          disabled={!canManage}
          className="rounded-xl"
        />
      </div>

      {canManage && (
        <Button
          size="sm"
          className="mt-3 rounded-xl bg-accent text-accent-foreground"
          disabled={!hasChanges || update.isPending}
          onClick={() => update.mutate({ enabled, limitUsd: Number(limitUsd) })}
        >
          {update.isPending ? 'Saving...' : 'Save changes'}
        </Button>
      )}

      <p className="mt-2 text-xs text-muted-foreground">
        Caps the source amount for USDT/USDC transfers only (cNGN is unaffected) while KYC integration is pending. Takes effect immediately, no redeploy needed.
      </p>
    </div>
  )
}

function AdminDashboard() {
  const { data: session } = authClient.useSession()
  const navigate = useNavigate()
  const stats = useQuery(adminStatsQueryOptions)
  const transactions = useQuery(adminTransactionsQueryOptions)
  const admins = useQuery(adminListQueryOptions)
  const waitlist = useQuery(adminWaitlistQueryOptions)
  const webhookConfig = useQuery(adminWebhookConfigQueryOptions)
  const [search, setSearch] = useState('')

  const filtered = transactions.data?.filter((t) => {
    const q = search.toLowerCase()
    return (
      !q ||
      t.reference.toLowerCase().includes(q) ||
      t.depositAddress.toLowerCase().includes(q) ||
      t.accountName.toLowerCase().includes(q) ||
      t.asset.toLowerCase().includes(q) ||
      (t.accountNumber ?? '').includes(q) ||
      (t.mobileNumber ?? '').includes(q)
    )
  })

  return (
    <div className="p-4 md:p-8 w-full text-foreground">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Transaction activity</h1>
          <p className="text-sm text-muted-foreground">
            Signed in as {session?.user?.email}
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => {
            authClient.signOut({
              fetchOptions: {
                onSuccess: () => navigate({ to: '/admin/login' }),
              },
            })
          }}
        >
          Sign out
        </Button>
      </div>

      {admins.data?.canManage && (
        <div className="mb-6">
          <Button variant="outline" size="sm" className="rounded-xl" asChild>
            <Link to="/admin/admins">Manage admins</Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total transfers" value={String(stats.data?.totalTransactions ?? '—')} />
        <StatCard label="Completed" value={String(stats.data?.totalCompleted ?? '—')} />
        <StatCard label="In progress" value={String(stats.data?.totalPending ?? '—')} />
        <StatCard
          label="Completed volume"
          value={stats.data ? `${stats.data.totalCompletedSourceUsd.toLocaleString('en-US', { maximumFractionDigits: 2 })} USDT/USDC` : '—'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <Drawer direction="right">
          <DrawerTrigger asChild>
            <button type="button" className="text-left rounded-xl p-4 bg-card border border-border hover:border-accent/50 transition-colors">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Waitlist signups</p>
              <p className="text-2xl font-bold text-foreground mt-1">{waitlist.data?.length ?? '—'}</p>
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Waitlist</DrawerTitle>
              <DrawerDescription>
                {waitlist.data?.length ?? 0} people opted in for feature and promo updates.
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col gap-2 overflow-y-auto px-4 text-sm">
              {waitlist.isLoading && <p className="text-muted-foreground">Loading...</p>}
              {waitlist.data?.length === 0 && <p className="text-muted-foreground">No signups yet.</p>}
              {waitlist.data?.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                  <CopyableText value={entry.email} />
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline" className="rounded-xl">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
        <div className="rounded-xl p-4 bg-card border border-border">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Switch webhook URL</p>
          {webhookConfig.data?.webhookUrl ? (
            <div className="mt-1">
              <CopyableText value={webhookConfig.data.webhookUrl} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">
              Set SERVER_URL in the environment to generate this URL.
            </p>
          )}
        </div>

        <div className="rounded-xl p-4 bg-card border border-border">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Providers status</p>
          <p className="text-sm text-muted-foreground mt-1">
            Live uptime for Switch and other integrated providers.
          </p>
          <a
            href="https://providers-status.coinmonie.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-accent hover:underline"
          >
            View status page →
          </a>
        </div>

        <DeveloperFeeCard canManage={admins.data?.canManage ?? false} />
        <TransactionLimitCard canManage={admins.data?.canManage ?? false} />
      </div>

      <InputGroup className="mb-4 max-w-sm rounded-xl!">
        <InputGroupInput
          placeholder="Search by reference, address, asset, account, phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <InputGroupAddon>
          <SearchIcon className="size-4" />
        </InputGroupAddon>
      </InputGroup>

      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader className="bg-card">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Network/Asset</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Received</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Tx hash</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {filtered?.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
            {filtered?.map((transaction) => (
              <Drawer key={transaction.reference} direction="right">
                <DrawerTrigger asChild>
                  <TableRow className="cursor-pointer">
                    <TableCell className="whitespace-nowrap text-sm">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <CopyableText value={transaction.reference} truncate />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm uppercase">
                      {transaction.asset.replace(':', '/')}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {transaction.sourceAmount} {transaction.sourceCurrency}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {transaction.destAmount} {transaction.destCurrency}
                    </TableCell>
                    <TableCell className="text-sm">
                      {transaction.channel === 'MOBILEMONEY'
                        ? `${transaction.mobileNetwork}: ${transaction.mobileNumber}`
                        : `${transaction.bankName || transaction.bankCode}: ${transaction.accountNumber}`}
                    </TableCell>
                    <TableCell>
                      {transaction.transactionHash ? (
                        <div className="flex items-center gap-1.5">
                          <CopyableText value={transaction.transactionHash} truncate />
                          {getExplorerUrl(transaction.asset, transaction.transactionHash) && (
                            <a
                              href={getExplorerUrl(transaction.asset, transaction.transactionHash)!}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-muted-foreground hover:text-accent transition-colors shrink-0"
                              aria-label="View on block explorer"
                            >
                              <ExternalLink className="size-3.5" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={transaction.status} />
                    </TableCell>
                  </TableRow>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Transaction details</DrawerTitle>
                    <DrawerDescription>
                      Created {new Date(transaction.createdAt).toLocaleString()}
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
                    <div>
                      <p className="text-xs uppercase text-muted-foreground font-medium mb-1">Status</p>
                      <StatusBadge status={transaction.status} />
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground font-medium mb-1">Reference</p>
                      <CopyableText value={transaction.reference} />
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground font-medium mb-1">Deposit address</p>
                      <CopyableText value={transaction.depositAddress} />
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground font-medium mb-1">Asset</p>
                      <p>{transaction.asset}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs uppercase text-muted-foreground font-medium mb-1">Sent</p>
                        <p>{transaction.sourceAmount} {transaction.sourceCurrency}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-muted-foreground font-medium mb-1">Received</p>
                        <p>{transaction.destAmount} {transaction.destCurrency}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground font-medium mb-1">Payout method</p>
                      <p>{transaction.channel}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground font-medium mb-1">Recipient</p>
                      <p>{transaction.accountName}</p>
                    </div>
                    {transaction.channel === 'MOBILEMONEY' ? (
                      <div>
                        <p className="text-xs uppercase text-muted-foreground font-medium mb-1">Mobile money</p>
                        <p>{transaction.mobileNetwork} — {transaction.mobileNumber}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs uppercase text-muted-foreground font-medium mb-1">Bank</p>
                        <p>{transaction.bankName || transaction.bankCode} — {transaction.accountNumber}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs uppercase text-muted-foreground font-medium mb-1">Transaction hash</p>
                      {transaction.transactionHash ? (
                        <div className="flex items-center gap-1.5">
                          <CopyableText value={transaction.transactionHash} />
                          {getExplorerUrl(transaction.asset, transaction.transactionHash) && (
                            <a
                              href={getExplorerUrl(transaction.asset, transaction.transactionHash)!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-accent transition-colors shrink-0"
                              aria-label="View on block explorer"
                            >
                              <ExternalLink className="size-3.5" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">N/A</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground font-medium mb-2">Webhook audit trail</p>
                      <WebhookEventsList reference={transaction.reference} />
                    </div>
                  </div>
                  <DrawerFooter>
                    <DrawerClose asChild>
                      <Button variant="outline" className="rounded-xl">Close</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
