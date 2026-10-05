import { useEffect, useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

import { AuthShell } from '#/components/auth/auth-shell'
import { EnvelopeBadge } from '#/components/auth/illustrations'
import { OtpInput } from '#/components/auth/otp-input'
import { PrimaryButton } from '#/components/auth/primary-button'
import { useCompleteSignIn } from '#/components/auth/use-complete-sign-in'
import { Separator } from '#/components/ui/separator'
import { authClient } from '#/lib/auth-client'

export const Route = createFileRoute('/verify-email')({
  validateSearch: z.object({ email: z.email().optional(), redirect: z.string().optional() }),
  beforeLoad: ({ search }) => {
    if (!search.email) throw redirect({ to: '/signup' })
  },
  head: () => ({ meta: [{ title: 'Verify your email · CoinMonie' }] }),
  component: VerifyEmail,
})

const RESEND_SECONDS = 60

function VerifyEmail() {
  const completeSignIn = useCompleteSignIn()
  const { email = '', redirect: next } = Route.useSearch()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // A code was emailed when the account was created, so start on cooldown.
  const [resendAt, setResendAt] = useState<number | null>(() => Date.now() + RESEND_SECONDS * 1000)
  const [now, setNow] = useState(() => Date.now())

  const resendSeconds = resendAt && resendAt > now ? Math.ceil((resendAt - now) / 1000) : null
  const enabled = code.length === 6 && !error && !loading

  useEffect(() => {
    if (!resendAt) return
    const timer = window.setInterval(() => setNow(Date.now()), 500)
    return () => window.clearInterval(timer)
  }, [resendAt])

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!enabled) return
    setLoading(true)
    const { error: failure } = await authClient.emailOtp.verifyEmail({ email, otp: code })
    if (failure) {
      setLoading(false)
      setError(
        failure.code === 'OTP_EXPIRED'
          ? 'This code has expired. Request another code.'
          : failure.code === 'TOO_MANY_ATTEMPTS'
            ? 'Too many attempts. Request another code.'
            : 'The code entered is wrong. Try again or request another code.',
      )
      return
    }
    // Verification signs the user in; new accounts set up their PIN next.
    await completeSignIn(next, '/create-pin')
  }

  const resend = async () => {
    if (resendSeconds !== null) return
    setError(null)
    setCode('')
    setResendAt(Date.now() + RESEND_SECONDS * 1000)
    setNow(Date.now())
    const { error: failure } = await authClient.emailOtp.sendVerificationOtp({ email, type: 'email-verification' })
    if (failure) setError(failure.message || 'We couldn’t send a new code. Try again shortly.')
  }

  const resendLabel =
    resendSeconds === null
      ? 'Resend it'
      : `Resend in ${Math.floor(resendSeconds / 60)}:${String(resendSeconds % 60).padStart(2, '0')}`

  return (
    <AuthShell>
      <EnvelopeBadge className="mx-auto" />
      <h1 className="mt-[22px] text-center text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
        Verify your email
      </h1>
      <p className="mt-[10px] text-center text-sm text-[#9a9a9a]">
        We've sent a 6-digit code to <span className="font-medium text-[#e6e6e6]">{email}</span>
      </p>

      <form noValidate onSubmit={submit}>
        <div className="mt-[35px] flex justify-center">
          <OtpInput
            value={code}
            onChange={(value) => {
              setCode(value)
              setError(null)
            }}
            error={Boolean(error)}
            disabled={loading}
            autoFocus
          />
        </div>
        {error ? (
          <p role="alert" className="mt-[12px] text-center text-[13px] text-[#e5484d]">
            {error}
          </p>
        ) : null}

        <Separator className="mt-[30px] bg-[#2f2f2f]" />

        <PrimaryButton type="submit" disabled={!enabled} loading={loading} className="mt-[13px]">
          Verify
        </PrimaryButton>
      </form>

      <p className="mt-[18px] text-center text-sm text-[#9a9a9a]">
        Didn't receive the code?{' '}
        <button
          type="button"
          onClick={resend}
          disabled={resendSeconds !== null}
          aria-live="polite"
          className={
            resendSeconds === null
              ? 'text-[#f5f5f5] underline decoration-[#f5f5f5] underline-offset-[3px] outline-none hover:text-white'
              : 'text-[#f5f5f5] tabular-nums outline-none'
          }
        >
          {resendLabel}
        </button>
      </p>
    </AuthShell>
  )
}
