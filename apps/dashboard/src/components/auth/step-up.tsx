import { createContext, use, useCallback, useMemo, useRef, useState } from 'react'

import { KeyIllustration } from '#/components/dashboard/illustrations'
import { CodeDialog, PinDialog } from '#/components/settings/dialogs'
import { authClient, authErrorMessage } from '#/lib/auth-client'

type PinPrompt = {
  title?: string
  description?: string
  confirmLabel?: string
}

type TwoFactorPrompt = {
  title?: string
  description?: string
  confirmLabel?: string
  /** Resolve immediately when the user hasn't turned on 2FA. Defaults to true. */
  skipIfDisabled?: boolean
}

type Factor = 'twoFactor' | 'pin'

type StepUp = {
  /** Ask for the account PIN (creating one first if needed). Resolves `false` when dismissed. */
  requirePin: (prompt?: PinPrompt) => Promise<boolean>
  /** Ask for an authenticator code. Resolves `false` when dismissed. */
  requireTwoFactor: (prompt?: TwoFactorPrompt) => Promise<boolean>
  /** Run several checks in order, stopping at the first one that's dismissed. */
  require: (factors: Factor[]) => Promise<boolean>
}

type Pending =
  | { kind: 'pin-verify'; prompt: PinPrompt }
  | { kind: 'pin-create' }
  | { kind: 'pin-confirm'; first: string }
  | { kind: 'two-factor'; prompt: TwoFactorPrompt }

const StepUpContext = createContext<StepUp | null>(null)

export function useStepUp() {
  const value = use(StepUpContext)
  if (!value) throw new Error('useStepUp must be used inside <StepUpProvider>')
  return value
}

/**
 * Hosts the PIN and 2FA confirmation dialogs once for the whole app so any
 * route can guard a sensitive action with `await requirePin()` /
 * `await requireTwoFactor()`. Every check is verified by the server.
 */
export function StepUpProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = authClient.useSession()
  const [pending, setPending] = useState<Pending | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const resolver = useRef<((ok: boolean) => void) | null>(null)

  const settle = useCallback((ok: boolean) => {
    resolver.current?.(ok)
    resolver.current = null
    setPending(null)
    setError(null)
    setLoading(false)
  }, [])

  const open = useCallback((next: Pending) => {
    // A new request supersedes one that's still open.
    resolver.current?.(false)
    setError(null)
    setLoading(false)
    setPending(next)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const requirePin = useCallback(
    async (prompt: PinPrompt = {}) => {
      const { data } = await authClient.pin.status()
      return open(data?.hasPin === false ? { kind: 'pin-create' } : { kind: 'pin-verify', prompt })
    },
    [open],
  )

  const twoFactorEnabled = Boolean(session?.user.twoFactorEnabled)
  const requireTwoFactor = useCallback(
    (prompt: TwoFactorPrompt = {}) => {
      if (!twoFactorEnabled && prompt.skipIfDisabled !== false) return Promise.resolve(true)
      return open({ kind: 'two-factor', prompt })
    },
    [open, twoFactorEnabled],
  )

  const value = useMemo<StepUp>(
    () => ({
      requirePin,
      requireTwoFactor,
      require: async (factors) => {
        for (const factor of factors) {
          const ok = factor === 'pin' ? await requirePin() : await requireTwoFactor()
          if (!ok) return false
        }
        return true
      },
    }),
    [requirePin, requireTwoFactor],
  )

  const run = async (action: () => Promise<{ error: { message?: string } | null }>, onSuccess: () => void) => {
    setLoading(true)
    setError(null)
    const { error: failure } = await action()
    setLoading(false)
    if (failure) {
      setError(authErrorMessage(failure))
      return
    }
    onSuccess()
  }

  return (
    <StepUpContext value={value}>
      {children}

      <PinDialog
        open={pending?.kind === 'pin-verify'}
        title={(pending?.kind === 'pin-verify' && pending.prompt.title) || 'Enter 6 digit PIN'}
        description={(pending?.kind === 'pin-verify' && pending.prompt.description) || 'Confirm it’s you.'}
        confirmLabel={(pending?.kind === 'pin-verify' && pending.prompt.confirmLabel) || 'Confirm'}
        forgotLink
        error={error}
        loading={loading}
        onChange={() => setError(null)}
        onClose={() => settle(false)}
        onComplete={(pin) => run(() => authClient.pin.verify({ pin }), () => settle(true))}
      />

      <PinDialog
        open={pending?.kind === 'pin-create'}
        title="Create 6 digit PIN"
        description="Create a secure 6 digit PIN to access your account"
        confirmLabel="Continue"
        reveal
        onClose={() => settle(false)}
        onComplete={(pin) => setPending({ kind: 'pin-confirm', first: pin })}
      />

      <PinDialog
        open={pending?.kind === 'pin-confirm'}
        title="Confirm 6 digit PIN"
        description="Re-enter your 6 digit PIN"
        confirmLabel="Create PIN"
        reveal
        error={error}
        loading={loading}
        onChange={() => setError(null)}
        onBack={() => setPending({ kind: 'pin-create' })}
        onClose={() => settle(false)}
        onComplete={(pin) => {
          if (pending?.kind !== 'pin-confirm') return
          if (pin !== pending.first) {
            setError('PINs don’t match. Try again.')
            return
          }
          void run(() => authClient.pin.set({ pin }), () => settle(true))
        }}
      />

      <CodeDialog
        open={pending?.kind === 'two-factor'}
        art={<KeyIllustration />}
        title={(pending?.kind === 'two-factor' && pending.prompt.title) || 'Enter 2FA code'}
        description={
          (pending?.kind === 'two-factor' && pending.prompt.description) ||
          'Enter the 6-digit code generated for Coinmonie from your authenticator app.'
        }
        confirmLabel={(pending?.kind === 'two-factor' && pending.prompt.confirmLabel) || 'Continue'}
        error={error}
        loading={loading}
        onChange={() => setError(null)}
        onClose={() => settle(false)}
        onComplete={(code) => run(() => authClient.twoFactor.verifyTotp({ code }), () => settle(true))}
      />
    </StepUpContext>
  )
}
