import { useState } from 'react'
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'

import { AuthShell } from '#/components/auth/auth-shell'
import { EmailField, FieldMessage, PasswordField } from '#/components/auth/fields'
import { PadlockIllustration } from '#/components/auth/illustrations'
import { PrimaryButton } from '#/components/auth/primary-button'
import { TwoFactorChallenge } from '#/components/auth/two-factor-challenge'
import { useCompleteSignIn } from '#/components/auth/use-complete-sign-in'
import { Separator } from '#/components/ui/separator'
import { authClient } from '#/lib/auth-client'
import { forgetAccount, getLastAccount } from '#/lib/last-account'
import { redirectIfSignedIn } from '#/lib/session'
import { EMAIL_RE } from '#/lib/validation'

const searchSchema = z.object({
  redirect: z.string().optional(),
  /** `password` skips the PIN screen; `other` ignores the remembered account. */
  with: z.enum(['password', 'other']).optional(),
})

export const Route = createFileRoute('/signin')({
  validateSearch: searchSchema,
  beforeLoad: async ({ search }) => {
    await redirectIfSignedIn()
    const lastAccount = search.with === 'other' ? null : await getLastAccount()
    if (lastAccount?.pin && search.with !== 'password') {
      throw redirect({ to: '/signin-pin', search: { redirect: search.redirect } })
    }
    return { lastAccount }
  },
  head: () => ({ meta: [{ title: 'Sign in · CoinMonie | Business' }] }),
  component: Signin,
})

const LINK = 'text-[#f5f5f5] underline decoration-[#f5f5f5] underline-offset-[3px] hover:text-white'

function Signin() {
  const navigate = useNavigate()
  const completeSignIn = useCompleteSignIn()
  const { redirect: next } = Route.useSearch()
  const { lastAccount } = Route.useRouteContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [challenge, setChallenge] = useState(false)

  const accountEmail = lastAccount?.email ?? email.trim()
  const enabled = (lastAccount ? true : EMAIL_RE.test(accountEmail)) && password !== ''

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!enabled || loading) return
    setLoading(true)
    setError(null)
    const { data, error: failure } = await authClient.signIn.email({ email: accountEmail, password })

    if (failure) {
      setLoading(false)
      if (failure.status === 403) {
        // Unverified: better-auth has just emailed a fresh code.
        navigate({ to: '/verify-email', search: { email: accountEmail, redirect: next } })
        return
      }
      setError(failure.status === 401 ? 'Incorrect email or password' : failure.message || 'Unable to sign in. Try again.')
      return
    }
    if ('twoFactorRedirect' in data && data.twoFactorRedirect) {
      setLoading(false)
      setChallenge(true)
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
      <PadlockIllustration />
      <h1 className="mt-[24px] text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
        {lastAccount ? `Welcome, ${lastAccount.firstName}` : 'Welcome'}
      </h1>
      <p className="mt-[10px] text-sm text-[#9a9a9a]">Enter your details to sign into your account.</p>

      <form noValidate onSubmit={submit}>
        <div className="mt-[37px]">
          {lastAccount ? null : (
            <div className="mb-[18px]">
              <EmailField value={email} onChange={setEmail} tone={error ? 'error' : undefined} disabled={loading} />
            </div>
          )}
          <PasswordField
            value={password}
            onChange={(value) => {
              setPassword(value)
              setError(null)
            }}
            tone={error ? 'error' : undefined}
            describedBy={error ? 'signin-error' : undefined}
            disabled={loading}
          />
          {error ? (
            <FieldMessage id="signin-error" tone="error">
              {error}
            </FieldMessage>
          ) : null}
          <div className="mt-[8px] flex justify-end">
            <Link to="/forgot-password" className={`text-[13px] ${LINK}`}>
              Forgot password
            </Link>
          </div>
        </div>

        <Separator className="mt-[34px] bg-[#2f2f2f]" />
        <PrimaryButton type="submit" disabled={!enabled} loading={loading} className="mt-[13px]">
          Sign in
        </PrimaryButton>
      </form>

      {lastAccount ? (
        <p className="mt-[22px] text-center text-sm text-[#9a9a9a]">
          Not {lastAccount.firstName}?{' '}
          <Link
            to="/signin"
            search={{ with: 'other', redirect: next }}
            onClick={forgetAccount}
            className={LINK}
          >
            Sign into another account
          </Link>
        </p>
      ) : null}

      <TwoFactorChallenge open={challenge} onCancel={() => setChallenge(false)} onVerified={() => completeSignIn(next)} />
    </AuthShell>
  )
}
