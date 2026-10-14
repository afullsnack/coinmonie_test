import { Fragment, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronRight, CircleX, Globe, Monitor, X } from 'lucide-react'

import { PrimaryButton } from '#/components/auth/primary-button'
import { TopToast } from '#/components/money/chrome'
import { ConfirmDialog, DialogShell, SecondaryButton } from '#/components/settings/dialogs'
import { Checkbox } from '#/components/ui/checkbox'
import { DialogDescription, DialogTitle } from '#/components/ui/dialog'
import { Separator } from '#/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '#/components/ui/sheet'
import { authClient, authErrorMessage } from '#/lib/auth-client'
import { describeUserAgent } from '#/lib/user-agent'

const ACTIONS = [
  'Single payouts',
  'Bulk payouts',
  'Withdrawals',
  'Conversions',
  'Add beneficiary',
  'Remove beneficiary',
] as const
const MEASURES = ['Password', '2FA', 'Passkey'] as const
type Levels = Record<(typeof ACTIONS)[number], Array<(typeof MEASURES)[number]>>

const EMPTY_LEVELS = Object.fromEntries(ACTIONS.map((action) => [action, []])) as unknown as Levels
const MIN_MEASURES = 2

export function SecurityLevelsSheet({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const [saved, setSaved] = useState<Levels>(EMPTY_LEVELS)
  const [draft, setDraft] = useState<Levels>(EMPTY_LEVELS)
  const [warning, setWarning] = useState(false)

  const close = () => {
    setDraft(saved)
    setWarning(false)
    onOpenChange(false)
  }

  const toggle = (action: (typeof ACTIONS)[number], measure: (typeof MEASURES)[number]) => {
    setWarning(false)
    setDraft((current) => {
      const picked = current[action]
      return {
        ...current,
        [action]: picked.includes(measure) ? picked.filter((m) => m !== measure) : [...picked, measure],
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <SheetContent
        showCloseButton={false}
        overlayClassName="bg-black/40"
        className="gap-0 border-0 bg-[#1c1c1c] p-0 text-[#f0f0f0] data-[side=right]:w-[420px] data-[side=right]:sm:max-w-[420px]"
      >
        {warning ? (
          <TopToast
            tone="info"
            className="absolute top-10 z-10 h-8 rounded-[10px] bg-[#333] text-xs [&_button]:ml-4"
            onClose={() => setWarning(false)}
          >
            Minimum of two security measures must be selected.
          </TopToast>
        ) : null}
        <div className="flex items-start justify-between p-5 pb-0">
          <div>
            <SheetTitle className="text-[15px] font-semibold text-white">Security levels</SheetTitle>
            <SheetDescription className="text-xs text-[#8d8d8d]">
              Choose the security checks required for sensitive actions.
            </SheetDescription>
          </div>
          <button type="button" aria-label="Close" onClick={close} className="text-white outline-none">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5">
          {ACTIONS.map((action) => (
            <Fragment key={action}>
              <Separator className="my-4 bg-[#333]" />
              <fieldset>
                <legend className="mb-2 text-xs text-[#8d8d8d]">{action}</legend>
                {MEASURES.map((measure) => {
                  const id = `${action}-${measure}`.replace(/\s/g, '-').toLowerCase()
                  return (
                    <label key={measure} htmlFor={id} className="flex h-8 cursor-pointer items-center justify-between text-sm">
                      {measure}
                      <Checkbox
                        id={id}
                        checked={draft[action].includes(measure)}
                        onCheckedChange={() => toggle(action, measure)}
                        className="size-3.5 rounded-[3px] border-[#5a5a5a] data-checked:border-[#e8e8e8] data-checked:bg-[#e8e8e8] data-checked:text-[#1c1c1c] dark:data-checked:bg-[#e8e8e8]"
                      />
                    </label>
                  )
                })}
              </fieldset>
            </Fragment>
          ))}
        </div>
        <div className="flex gap-2 border-t border-[#2a2a2a] p-5">
          <SecondaryButton onClick={close}>Cancel</SecondaryButton>
          <PrimaryButton
            type="button"
            className="flex-1"
            onClick={() => {
              if (ACTIONS.some((action) => draft[action].length < MIN_MEASURES)) {
                setWarning(true)
                return
              }
              setSaved(draft)
              onOpenChange(false)
              onSaved()
            }}
          >
            Save changes
          </PrimaryButton>
        </div>
      </SheetContent>
    </Sheet>
  )
}

type Session = {
  id: string
  token: string
  device: string
  lastLogin: string
  location: string
  current: boolean
}

function formatLogin(date: Date | string) {
  const value = new Date(date)
  const day = value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const time = value.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return `${day} • ${time}`
}

export function ActiveSessionsPanel({
  open,
  onOpenChange,
  onRemoved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRemoved: (session: Session) => void
}) {
  const queryClient = useQueryClient()
  const { data: current } = authClient.useSession()
  const sessionsQuery = useQuery({
    queryKey: ['auth', 'sessions'],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await authClient.listSessions()
      if (error) throw new Error(error.message)
      return data
    },
  })
  const sessions: Session[] = (sessionsQuery.data ?? [])
    .map((item) => ({
      id: item.id,
      token: item.token,
      device: describeUserAgent(item.userAgent),
      lastLogin: formatLogin(item.updatedAt ?? item.createdAt),
      location: item.ipAddress || 'Unknown location',
      current: item.id === current?.session.id,
    }))
    .sort((a, b) => Number(b.current) - Number(a.current))
  const [detail, setDetail] = useState<Session | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [removeError, setRemoveError] = useState<string | null>(null)

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          showCloseButton={false}
          overlayClassName="bg-black/60 backdrop-blur-md"
          className="gap-0 rounded-bl-[20px] border-0 bg-[#1c1c1c] p-4 text-[#f0f0f0] data-[side=right]:bottom-auto data-[side=right]:h-auto data-[side=right]:w-[400px] data-[side=right]:sm:max-w-[400px]"
        >
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold text-white">Active sessions</SheetTitle>
            <button type="button" aria-label="Close" onClick={() => onOpenChange(false)} className="text-white outline-none">
              <X className="size-5" />
            </button>
          </div>
          <div className="mt-3">
            {sessionsQuery.isPending ? (
              <p className="py-6 text-center text-sm text-[#8d8d8d]">Loading sessions…</p>
            ) : sessionsQuery.isError ? (
              <p role="alert" className="py-6 text-center text-sm text-[#e5484d]">
                We couldn’t load your sessions.
              </p>
            ) : sessions.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#8d8d8d]">No other active sessions</p>
            ) : (
              sessions.map((session, index) => (
                <Fragment key={session.id}>
                  {index > 0 ? <Separator className="bg-[#333]" /> : null}
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="flex items-center gap-1.5 text-sm text-[#f0f0f0]">
                        <Monitor className="size-3.5 fill-[#d0d0d0] text-[#d0d0d0]" />
                        {session.device}
                        {session.current ? (
                          <span className="rounded-full bg-[#1d3a26] px-1.5 py-px text-[10px] text-[#30c463]">
                            This device
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 pl-5 text-xs text-[#8d8d8d]">Last login {session.lastLogin}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenChange(false)
                        setDetail(session)
                      }}
                      className="flex items-center gap-1 text-xs text-[#e8e8e8] outline-none hover:text-white"
                    >
                      See details
                      <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                </Fragment>
              ))
            )}
          </div>
          <PrimaryButton type="button" className="mt-2" onClick={() => onOpenChange(false)}>
            Close
          </PrimaryButton>
        </SheetContent>
      </Sheet>

      <DialogShell open={detail !== null && !confirming} onClose={() => setDetail(null)} className="pt-10">
        <Globe className="mx-auto size-9 text-[#e8e8e8]" />
        <DialogTitle className="mt-4 text-base font-semibold text-white">{detail?.device}</DialogTitle>
        <DialogDescription className="text-[13px] text-[#8d8d8d]">
          Currently active, {detail?.location}
        </DialogDescription>
        <button
          type="button"
          hidden={detail?.current}
          onClick={() => setConfirming(true)}
          className="mt-5 flex w-full gap-2 rounded-[12px] bg-[#3a1d1d] px-3 py-2.5 text-left outline-none hover:bg-[#432121]"
        >
          <CircleX className="mt-0.5 size-3.5 shrink-0 fill-[#e5484d] text-[#3a1d1d]" />
          <span>
            <span className="block text-sm font-medium text-[#f0f0f0]">Remove this device</span>
            <span className="block text-xs text-[#a28c8c]">
              Revoke login tokens and delete this device from your approved device
            </span>
          </span>
        </button>
        <PrimaryButton type="button" className="mt-5" onClick={() => setDetail(null)}>
          Close
        </PrimaryButton>
      </DialogShell>

      <ConfirmDialog
        open={confirming}
        title="Remove this device"
        description="Are you sure you want to remove this device?"
        warning={
          <>
            You will no longer be able to login from your <b>{detail?.device}</b> until log in is approved
          </>
        }
        cancelLabel="No, cancel"
        confirmLabel="Yes, remove"
        destructive
        error={removeError}
        loading={removing}
        onCancel={() => {
          setConfirming(false)
          setRemoveError(null)
        }}
        onConfirm={async () => {
          if (!detail) return
          setRemoving(true)
          const { error } = await authClient.revokeSession({ token: detail.token })
          setRemoving(false)
          if (error) {
            setRemoveError(authErrorMessage(error, 'We couldn’t remove this device. Try again.'))
            return
          }
          await queryClient.invalidateQueries({ queryKey: ['auth', 'sessions'] })
          onRemoved(detail)
          setConfirming(false)
          setDetail(null)
        }}
      />
    </>
  )
}
