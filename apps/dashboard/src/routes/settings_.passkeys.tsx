import { requireSession } from '#/lib/session'
import { useMemo, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Info, Plus, Trash2 } from 'lucide-react'

import { useStepUp } from '#/components/auth/step-up'
import { OrbsIllustration } from '#/components/dashboard/illustrations'
import { FlowFrame, TopToast } from '#/components/money/chrome'
import { DataTable, createDataColumns } from '#/components/money/data-table'
import { ConfirmDialog } from '#/components/settings/dialogs'
import { PasskeyFlow } from '#/components/settings/security-flows'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '#/components/ui/empty'
import { Separator } from '#/components/ui/separator'
import { authClient, authErrorMessage } from '#/lib/auth-client'

export const Route = createFileRoute('/settings_/passkeys')({
  beforeLoad: requireSession,
  head: () => ({ meta: [{ title: 'Passkeys · CoinMonie' }] }),
  component: PasskeysPage,
})

const PASSKEY_LIMIT = 10

type PasskeyRow = { id: string; name: string; created: string }

function formatStamp(date: Date | string) {
  const value = new Date(date)
  const day = value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const time = value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${day} ${time}`
}

const col = createDataColumns<PasskeyRow>()

function PasskeysPage() {
  const navigate = useNavigate()
  const stepUp = useStepUp()
  const { session } = Route.useRouteContext()
  const passkeys = authClient.useListPasskeys()
  const [deleting, setDeleting] = useState<PasskeyRow | null>(null)
  const [createStep, setCreateStep] = useState<'name' | 'code' | 'done' | null>(null)
  const [toast, setToast] = useState<{ tone?: 'info'; text: React.ReactNode } | null>(null)

  const rows = useMemo<PasskeyRow[]>(
    () =>
      (passkeys.data ?? []).map((key) => ({
        id: key.id,
        name: key.name || 'Unnamed passkey',
        created: formatStamp(key.createdAt),
      })),
    [passkeys.data],
  )
  const atLimit = rows.length >= PASSKEY_LIMIT

  const columns = useMemo(
    () =>
      col.columns([
        col.accessor('name', { header: 'Passkey name', meta: { width: '45%' } }),
        col.accessor('created', { header: 'Created', meta: { width: '40%' } }),
        col.display({
          id: 'actions',
          header: 'Actions',
          cell: ({ row }) => (
            <button
              type="button"
              onClick={() => setDeleting(row.original)}
              className="flex items-center gap-1 text-sm text-[#e5484d] outline-none hover:text-[#ff6b6f]"
            >
              <Trash2 className="size-3.5" />
              Delete
            </button>
          ),
        }),
      ]),
    [],
  )

  const removePasskey = async (target: PasskeyRow) => {
    setDeleting(null)
    if (!(await stepUp.requirePin())) return
    const { error } = await authClient.passkey.deletePasskey({ id: target.id })
    if (error) {
      setToast({ tone: 'info', text: authErrorMessage(error, 'We couldn’t remove this passkey. Try again.') })
      return
    }
    await passkeys.refetch()
    setToast({
      text: (
        <>
          <b>Passkey</b> has been removed successfully
        </>
      ),
    })
  }

  return (
    <FlowFrame onBack={() => navigate({ to: '/settings/security' })}>
      {toast ? (
        <TopToast tone={toast.tone} onClose={() => setToast(null)}>
          {toast.text}
        </TopToast>
      ) : null}
      <div className="mt-10 flex items-center justify-between">
        <h1 className="text-[22px] font-semibold text-white">Passkeys</h1>
        <button
          type="button"
          disabled={atLimit}
          onClick={() => setCreateStep('name')}
          className="flex h-11 items-center gap-2 rounded-[14px] bg-[#f0f0f0] px-5 text-[15px] text-[#1a1a1a] outline-none hover:bg-white disabled:opacity-50"
        >
          <Plus className="size-4" />
          Create new passkey
        </button>
      </div>
      <Separator className="my-4 bg-[#262626]" />
      <Alert className="rounded-[12px] border-0 bg-[#1b2333] px-3 py-3">
        <Info className="fill-[#3b82f6] text-[#1b2333]!" />
        <AlertDescription className="text-[13px] text-[#8d93a0]">
          <span>
            You&apos;ve created {rows.length} passkey{rows.length === 1 ? '' : 's'},{' '}
            <b className="font-medium text-[#f0f0f0]">the limit is {PASSKEY_LIMIT}</b>. Give your passkeys unique names
            to help you identify them.
          </span>
        </AlertDescription>
      </Alert>

      <DataTable
        tone="raised"
        className="mt-3"
        columns={columns}
        data={rows}
        getRowId={(key) => key.id}
        rowClassName="[&>td]:h-[52px]"
        footer={
          !passkeys.isPending && rows.length === 0 ? (
            <Empty className="border-0 py-10">
              <EmptyHeader>
                <EmptyMedia>
                  <OrbsIllustration />
                </EmptyMedia>
                <EmptyTitle className="text-xl text-white">You don&apos;t have any passkeys yet</EmptyTitle>
                <EmptyDescription>Create a passkey to add an extra layer of security to your account.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : null
        }
      />

      <ConfirmDialog
        open={deleting !== null}
        art={<Trash2 className="size-12 fill-[#e5484d] text-[#e5484d]" />}
        title={`Delete "${deleting?.name ?? ''}"`}
        description={
          <>
            Are you sure you want to remove <b>{deleting?.name}</b> passkey?
          </>
        }
        warning="Removing this passkey means you can no longer use it to sign in, and this can't be reversed."
        confirmLabel="Yes, delete"
        destructive
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && void removePasskey(deleting)}
      />

      <PasskeyFlow
        step={createStep}
        email={session.user.email}
        onStep={setCreateStep}
        onCreated={() => void passkeys.refetch()}
      />
    </FlowFrame>
  )
}
