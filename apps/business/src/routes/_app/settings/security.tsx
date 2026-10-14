import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { ChevronRight, CircleAlert, CircleCheck, Info, KeyRound, Monitor, RectangleEllipsis, ShieldHalf } from 'lucide-react'

import { useStepUp } from '#/components/auth/step-up'
import { KeyIllustration } from '#/components/dashboard/illustrations'
import { TopToast } from '#/components/money/chrome'
import { ConfirmDialog, PasswordConfirmDialog } from '#/components/settings/dialogs'
import { PasskeyFlow, TwoFactorFlow } from '#/components/settings/security-flows'
import { ActiveSessionsPanel, SecurityLevelsSheet } from '#/components/settings/security-panels'
import { ChevronPill, SectionTitle, SettingsDivider, SettingsRow } from '#/components/settings/settings-ui'
import { Switch } from '#/components/ui/switch'
import { authClient, authErrorMessage, refreshSession } from '#/lib/auth-client'
import { updateRememberedAccount } from '#/lib/last-account'

export const Route = createFileRoute('/_app/settings/security')({
  component: SecuritySettings,
})

type Flow =
  | 'twofa-password'
  | 'twofa-setup'
  | 'twofa-code'
  | 'twofa-off'
  | 'twofa-off-password'
  | 'passkey-name'
  | 'passkey-code'
  | 'passkey-done'
  | 'levels'
  | 'sessions'
  | null

const SWITCH = 'data-checked:bg-[#30c463]'
const PIN_STATUS_KEY = ['auth', 'pin-status']

function passwordError(error: { code?: string; message?: string }) {
  if (error.code === 'INVALID_PASSWORD') return 'Incorrect password'
  if (error.code === 'SESSION_NOT_FRESH') return 'For your security, sign out and sign in again before making this change.'
  return authErrorMessage(error)
}

function SecuritySettings() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const stepUp = useStepUp()
  const { session: initialSession } = Route.useRouteContext()
  const { data: liveSession } = authClient.useSession()
  const session = liveSession ?? initialSession
  const passkeys = authClient.useListPasskeys()
  const pinStatus = useQuery({
    queryKey: PIN_STATUS_KEY,
    queryFn: async () => {
      const { data, error } = await authClient.pin.status()
      if (error) throw new Error(error.message)
      return data
    },
  })

  const [flow, setFlow] = useState<Flow>(null)
  const [totpURI, setTotpURI] = useState<string | null>(null)
  const [passwordFailure, setPasswordFailure] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<{ tone?: 'success' | 'info'; text: React.ReactNode } | null>(null)

  const twoFactorEnabled = Boolean(session?.user.twoFactorEnabled)
  const pinLogin = Boolean(pinStatus.data?.loginEnabled)
  const hasPasskeys = (passkeys.data?.length ?? 0) > 0

  const twoFactorStep = flow === 'twofa-setup' ? 'setup' : flow === 'twofa-code' ? 'code' : null
  const passkeyStep =
    flow === 'passkey-name' ? 'name' : flow === 'passkey-code' ? 'code' : flow === 'passkey-done' ? 'done' : null

  const openFlow = (next: Flow) => {
    setPasswordFailure(null)
    setFlow(next)
  }

  const afterTwoFactorChange = async (text: string) => {
    await refreshSession()
    await router.invalidate()
    setToast({ text })
  }

  const enableTwoFactor = async (password: string) => {
    setBusy(true)
    const { data, error } = await authClient.twoFactor.enable({ password })
    setBusy(false)
    if (error) {
      setPasswordFailure(passwordError(error))
      return
    }
    if (data.method !== 'totp') return
    setTotpURI(data.totpURI)
    openFlow('twofa-setup')
  }

  const disableTwoFactor = async (password: string) => {
    setBusy(true)
    const { error } = await authClient.twoFactor.disable({ password })
    setBusy(false)
    if (error) {
      setPasswordFailure(passwordError(error))
      return
    }
    openFlow(null)
    await afterTwoFactorChange('Two-factor authentication turned off')
  }

  const setPinLogin = async (enabled: boolean) => {
    if (enabled && !(await stepUp.requirePin({ description: 'Confirm your PIN to turn on PIN login.' }))) return
    setBusy(true)
    const { error } = await authClient.pin.login({ enabled })
    setBusy(false)
    if (error) {
      setToast({ tone: 'info', text: authErrorMessage(error) })
      return
    }
    updateRememberedAccount({ pin: enabled })
    await queryClient.invalidateQueries({ queryKey: PIN_STATUS_KEY })
    setToast({ text: enabled ? 'PIN login has been turned on' : 'PIN login has been turned off' })
  }

  return (
    <div className="max-w-[448px]">
      {toast ? (
        <TopToast tone={toast.tone} onClose={() => setToast(null)}>
          {toast.text}
        </TopToast>
      ) : null}

      <SectionTitle>Security</SectionTitle>
      <div className="mt-4 flex flex-col gap-2">
        <SettingsRow
          icon={ShieldHalf}
          label="Two-factor authentication"
          trailing={
            <>
              {twoFactorEnabled ? (
                <span className="flex items-center gap-1 text-sm font-medium text-[#30c463]">
                  <CircleCheck className="size-3.5 fill-[#30c463] text-[#262626]" />
                  Enabled
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm font-medium text-[#ff4d4f]">
                  <CircleAlert className="size-3.5 fill-[#ff4d4f] text-[#262626]" />
                  Not enabled
                </span>
              )}
              <Switch
                checked={twoFactorEnabled}
                disabled={!session}
                onCheckedChange={(checked) => openFlow(checked ? 'twofa-password' : 'twofa-off')}
                aria-label="Two-factor authentication"
                className={SWITCH}
              />
            </>
          }
        />
        <SettingsRow
          icon={RectangleEllipsis}
          label="Log in with PIN"
          trailing={
            <Switch
              checked={pinLogin}
              disabled={pinStatus.isPending || busy}
              onCheckedChange={(checked) => void setPinLogin(checked)}
              aria-label="Log in with PIN"
              className={SWITCH}
            />
          }
        />
        <SettingsRow
          icon={KeyRound}
          label={
            <>
              Add passkey
              <Info className="size-3 text-[#9a9a9a]" aria-label="Passkeys let you sign in with your device" />
            </>
          }
          trailing={
            hasPasskeys ? (
              <>
                <span className="mr-4 flex items-center gap-1 text-sm font-medium text-[#30c463]">
                  <CircleCheck className="size-3.5 fill-[#30c463] text-[#262626]" />
                  Enabled
                </span>
                <Link
                  to="/settings/passkeys"
                  className="flex items-center gap-1 text-sm text-[#f0f0f0] outline-none hover:text-white"
                >
                  Manage
                  <ChevronRight className="size-3.5" />
                </Link>
              </>
            ) : (
              <Switch
                checked={false}
                disabled={passkeys.isPending || !session}
                onCheckedChange={(checked) => checked && openFlow('passkey-name')}
                aria-label="Add passkey"
                className={SWITCH}
              />
            )
          }
        />
      </div>

      <SettingsDivider />

      <div className="flex flex-col gap-2">
        <SettingsRow
          icon={ShieldHalf}
          label={
            <>
              Security levels
              <Info className="size-3 text-[#9a9a9a]" aria-label="Checks required for sensitive actions" />
            </>
          }
          trailing={<ChevronPill />}
          onClick={() => openFlow('levels')}
        />
        <SettingsRow icon={Monitor} label="Active sessions" trailing={<ChevronPill />} onClick={() => openFlow('sessions')} />
      </div>

      <SettingsDivider />

      <SettingsRow
        icon={KeyRound}
        label={
          <span className="text-base tracking-[0.15em]" aria-label="Password">
            ••••••••
          </span>
        }
      />
      <Link
        to="/forgot-password"
        className="mt-1 inline-flex h-7 items-center rounded-full bg-[#262626] px-3 text-sm text-[#f0f0f0] outline-none hover:bg-[#2e2e2e]"
      >
        Reset password
      </Link>

      <PasswordConfirmDialog
        open={flow === 'twofa-password'}
        title="Set up two-factor authentication"
        description="Enter your password to start setting up your authenticator."
        error={passwordFailure}
        loading={busy}
        onChange={() => setPasswordFailure(null)}
        onClose={() => openFlow(null)}
        onConfirm={(password) => void enableTwoFactor(password)}
      />

      <TwoFactorFlow
        step={twoFactorStep}
        totpURI={totpURI}
        onStep={(step) => openFlow(step === 'setup' ? 'twofa-setup' : step === 'code' ? 'twofa-code' : null)}
        onActivated={() => {
          setTotpURI(null)
          void afterTwoFactorChange('Two-factor authentication has been activated')
        }}
      />

      <ConfirmDialog
        open={flow === 'twofa-off'}
        art={<KeyIllustration />}
        title="Turn off 2FA?"
        description="Are you sure you want to turn off two factor authentication?"
        warning="Removing two factor authentication will remove an extra layer of protection to your business dashboard"
        confirmLabel="Yes, turn off"
        onCancel={() => openFlow(null)}
        onConfirm={() => openFlow('twofa-off-password')}
      />
      <PasswordConfirmDialog
        open={flow === 'twofa-off-password'}
        title="Turn off 2FA"
        description="Enter your password to turn off two-factor authentication."
        confirmLabel="Turn off"
        error={passwordFailure}
        loading={busy}
        onChange={() => setPasswordFailure(null)}
        onClose={() => openFlow(null)}
        onConfirm={(password) => void disableTwoFactor(password)}
      />

      {session ? (
        <PasskeyFlow
          step={passkeyStep}
          email={session.user.email}
          onStep={(step) =>
            openFlow(
              step === 'name' ? 'passkey-name' : step === 'code' ? 'passkey-code' : step === 'done' ? 'passkey-done' : null,
            )
          }
          onCreated={() => void passkeys.refetch()}
        />
      ) : null}

      <SecurityLevelsSheet
        open={flow === 'levels'}
        onOpenChange={(open) => openFlow(open ? 'levels' : null)}
        onSaved={() => setToast({ text: 'Security levels have been updated' })}
      />

      <ActiveSessionsPanel
        open={flow === 'sessions'}
        onOpenChange={(open) => openFlow(open ? 'sessions' : null)}
        onRemoved={(removed) =>
          setToast({
            text: (
              <>
                <b>{removed.device}</b> has been removed
              </>
            ),
          })
        }
      />
    </div>
  )
}
