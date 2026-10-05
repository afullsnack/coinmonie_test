import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'

import { BackHeader } from '#/components/auth/back-header'
import { FieldMessage, PasswordField } from '#/components/auth/fields'
import { PadlockIllustration } from '#/components/auth/illustrations'
import { PrimaryButton } from '#/components/auth/primary-button'
import { SuccessModal } from '#/components/auth/success-modal'
import { Separator } from '#/components/ui/separator'
import { authClient } from '#/lib/auth-client'
import { PASSWORD_HINT, PASSWORD_MIN_LENGTH, passwordStrength } from '#/lib/validation'

export const Route = createFileRoute('/reset-password')({
  // better-auth redirects here with `?token=` or `?error=INVALID_TOKEN`.
  validateSearch: z.object({ token: z.string().optional(), error: z.string().optional() }),
  head: () => ({ meta: [{ title: 'Create new password · CoinMonie' }] }),
  component: ResetPassword,
})

function ResetPassword() {
  const navigate = useNavigate()
  const { token, error: linkError } = Route.useSearch()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const strength = passwordStrength(password)
  const mismatch = confirm.length > 0 && confirm !== password
  const enabled = password.length >= PASSWORD_MIN_LENGTH && strength === 'strong' && confirm === password

  if (!token || linkError) {
    return (
      <div className="min-h-dvh bg-[#1a1a1a] font-sans antialiased">
        <BackHeader />
        <main className="mx-auto w-[448px] max-w-[calc(100%-48px)] pt-[34px] pb-16">
          <PadlockIllustration />
          <h1 className="mt-[24px] text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
            This link has expired
          </h1>
          <p className="mt-[10px] text-sm text-[#9a9a9a]">Request a new link to reset your password.</p>
          <Separator className="mt-[32px] bg-[#2f2f2f]" />
          <PrimaryButton type="button" className="mt-[14px]" onClick={() => navigate({ to: '/forgot-password' })}>
            Request new link
          </PrimaryButton>
        </main>
      </div>
    )
  }

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!enabled || loading) return
    setLoading(true)
    setError(null)
    const { error: failure } = await authClient.resetPassword({ newPassword: password, token })
    setLoading(false)
    if (failure) {
      setError(
        failure.code === 'INVALID_TOKEN' ? 'This link has expired. Request a new one.' : failure.message || 'Something went wrong. Try again.',
      )
      return
    }
    setDone(true)
  }

  return (
    <div className="min-h-dvh bg-[#1a1a1a] font-sans antialiased">
      <BackHeader />
      <main className="mx-auto w-[448px] max-w-[calc(100%-48px)] pt-[34px] pb-16">
        <PadlockIllustration />
        <h1 className="mt-[24px] text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
          Create new password
        </h1>
        <form noValidate onSubmit={submit}>
          <div className="mt-[32px]">
            <PasswordField
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              tone={strength === 'strong' ? undefined : strength === 'fair' ? 'warning' : strength ? 'error' : undefined}
              describedBy={strength && strength !== 'strong' ? 'reset-hint' : undefined}
              disabled={loading}
            />
            {strength && strength !== 'strong' ? (
              <FieldMessage id="reset-hint" tone={strength === 'fair' ? 'warning' : 'error'}>
                {PASSWORD_HINT[strength]}
              </FieldMessage>
            ) : null}
          </div>
          <div className="mt-[23px]">
            <PasswordField
              name="confirmPassword"
              value={confirm}
              onChange={setConfirm}
              autoComplete="new-password"
              placeholder="Confirm password"
              label="Confirm password"
              tone={mismatch ? 'error' : undefined}
              describedBy={mismatch ? 'reset-mismatch' : undefined}
              disabled={loading}
            />
            {mismatch ? (
              <FieldMessage id="reset-mismatch" tone="error">
                Passwords don’t match
              </FieldMessage>
            ) : null}
          </div>
          {error ? (
            <FieldMessage tone="error">
              {error}{' '}
              {error.includes('expired') ? (
                <Link to="/forgot-password" className="underline underline-offset-2">
                  Request link
                </Link>
              ) : null}
            </FieldMessage>
          ) : null}
          <Separator className="mt-[32px] bg-[#2f2f2f]" />
          <PrimaryButton type="submit" disabled={!enabled} loading={loading} className="mt-[14px]">
            Create password
          </PrimaryButton>
        </form>
      </main>

      {done ? (
        <SuccessModal
          title="Password created"
          message="Your new password has been created successfully"
          actionLabel="Go to dashboard"
          onAction={() => navigate({ to: '/signin', search: { with: 'password', redirect: '/dashboard' } })}
          onClose={() => navigate({ to: '/signin', search: { with: 'password' } })}
        />
      ) : null}
    </div>
  )
}
