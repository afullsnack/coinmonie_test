import { useEffect, useRef, useState } from 'react'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { z } from 'zod'

import { AuthShell } from '#/components/auth/auth-shell'
import { UnlockIllustration } from '#/components/auth/illustrations'
import { Keypad } from '#/components/auth/keypad'
import { OtpInput } from '#/components/auth/otp-input'
import { TwoFactorChallenge } from '#/components/auth/two-factor-challenge'
import { useCompleteSignIn } from '#/components/auth/use-complete-sign-in'
import { Separator } from '#/components/ui/separator'
import { authClient } from '#/lib/auth-client'
import { getLastAccount, updateRememberedAccount } from '#/lib/last-account'
import { redirectIfSignedIn } from '#/lib/session'

export const Route = createFileRoute('/signin-pin')({
  validateSearch: z.object({ redirect: z.string().optional() }),
  beforeLoad: async ({ search }) => {
    await redirectIfSignedIn()
    const lastAccount = await getLastAccount()
    if (!lastAccount?.pin) throw redirect({ to: '/signin', search: { redirect: search.redirect } })
    return { lastAccount }
  },
  head: () => ({ meta: [{ title: 'Sign in · CoinMonie' }] }),
  component: SigninPin,
})

const LINK = 'text-[#f5f5f5] underline decoration-[#f5f5f5] underline-offset-[3px] hover:text-white'

function SigninPin() {
  const completeSignIn = useCompleteSignIn()
  const { redirect: next } = Route.useSearch()
  const { lastAccount } = Route.useRouteContext()
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<{ message: string; locked?: boolean } | null>(null)
  const [challenge, setChallenge] = useState(false)
  const submitted = useRef('')

  useEffect(() => {
    if (pin.length !== 6 || loading || submitted.current === pin) return
    submitted.current = pin
    setLoading(true)
    void authClient.signIn.pin({ email: lastAccount.email, pin }).then(async ({ data, error: failure }) => {
      if (failure) {
        setLoading(false)
        setPin('')
        submitted.current = ''
        if (failure.code === 'PIN_LOGIN_DISABLED') updateRememberedAccount({ pin: false })
        setError({
          message: failure.status === 429 ? 'Too many attempts. Wait a minute and try again.' : failure.message || 'The PIN entered is wrong',
          locked: failure.code === 'PIN_LOCKED',
        })
        return
      }
      if (data.twoFactorRedirect) {
        setLoading(false)
        setChallenge(true)
        return
      }
      await completeSignIn(next)
    })
  }, [pin, loading, lastAccount.email, next, completeSignIn])

  const update = (value: string) => {
    setPin(value.replace(/\D/g, '').slice(0, 6))
    setError(null)
  }

  const signInWithPasskey = async () => {
    setError(null)
    const { error: failure } = await authClient.signIn.passkey()
    if (failure) {
      setError({ message: failure.message || 'Passkey sign in was cancelled' })
      return
    }
    await completeSignIn(next)
  }

  return (
    <AuthShell
      footer={
        <p className="mt-[24px] text-center text-sm text-[#9a9a9a]">
          Don't have an account yet?{' '}
          <Link to="/signup" className={LINK}>
            Create account
          </Link>
        </p>
      }
    >
      <UnlockIllustration className="mx-auto" />
      <h1 className="mt-[24px] text-center text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
        Welcome, {lastAccount.firstName}
      </h1>
      <p className="mt-[10px] text-center text-sm text-[#9a9a9a]">Enter your 6 digit PIN to sign into your account.</p>

      <Separator className="mt-[20px] bg-[#2f2f2f]" />
      <div className="mt-[13px] flex justify-center">
        <OtpInput value={pin} onChange={update} masked error={Boolean(error)} disabled={loading} label="PIN" autoFocus />
      </div>
      {error ? (
        <p role="alert" className="mt-[10px] text-center text-[13px] text-[#e5484d]">
          {error.message}
        </p>
      ) : null}
      <div className="mt-[16px] flex justify-center gap-4 text-[13px]">
        <Link to="/forgot-pin" className={error?.locked ? `${LINK} font-medium` : LINK}>
          Forgot PIN
        </Link>
        <Link to="/signin" search={{ with: 'password', redirect: next }} className={LINK}>
          Use password
        </Link>
      </div>

      <div className="mt-[32px]">
        <Keypad
          disabled={loading}
          onDigit={(digit) => update(pin + digit)}
          onBackspace={() => update(pin.slice(0, -1))}
          onBiometric={signInWithPasskey}
        />
      </div>

      <TwoFactorChallenge
        open={challenge}
        onCancel={() => setChallenge(false)}
        onVerified={() => completeSignIn(next)}
      />
    </AuthShell>
  )
}
