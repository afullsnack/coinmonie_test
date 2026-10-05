import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { BackHeader } from '#/components/auth/back-header'
import { Separator } from '#/components/ui/separator'
import { EmailField, FieldMessage } from '#/components/auth/fields'
import { authClient } from '#/lib/auth-client'
import {
  PadlockIllustration,
  UnlockIllustration,
} from '#/components/auth/illustrations'
import { PrimaryButton } from '#/components/auth/primary-button'
import { EMAIL_RE } from '#/lib/validation'

type ResetKind = 'password' | 'pin'

const COPY: Record<ResetKind, { title: string; subtitle: string }> = {
  password: {
    title: 'Enter your email',
    subtitle: 'Enter your email to receive the link to reset your password.',
  },
  pin: {
    title: 'Enter your email',
    subtitle: 'Enter your email to receive the link to reset your PIN.',
  },
}

/**
 * Shared "Enter your email" screen for the reset-password and reset-PIN
 * flows; the kind only swaps the illustration and copy.
 */
export function ForgotEmailScreen({ kind, defaultEmail = '' }: { kind: ResetKind; defaultEmail?: string }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState(defaultEmail)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const address = email.trim()
  const enabled = EMAIL_RE.test(address)

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!enabled || loading) return
    setLoading(true)
    setError(null)
    // Both endpoints answer the same whether or not the account exists.
    const { error: failure } =
      kind === 'password'
        ? await authClient.requestPasswordReset({ email: address, redirectTo: '/reset-password' })
        : await authClient.pin.requestReset({ email: address })
    setLoading(false)
    if (failure) {
      setError(failure.status === 429 ? 'Too many requests. Try again in a minute.' : failure.message || 'Something went wrong. Try again.')
      return
    }
    navigate({ to: '/mail-sent', search: { flow: kind, email: address } })
  }

  return (
    <div className="min-h-dvh bg-[#1a1a1a] font-sans antialiased">
      <BackHeader />
      <main className="mx-auto w-[448px] max-w-[calc(100%-48px)] pt-[34px] pb-16">
        {kind === 'password' ? <PadlockIllustration /> : <UnlockIllustration />}
        <h1 className="mt-[24px] text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
          {COPY[kind].title}
        </h1>
        <p className="mt-[10px] text-sm text-[#9a9a9a]">
          {COPY[kind].subtitle}
        </p>
        <form noValidate onSubmit={submit}>
          <div className="mt-[32px]">
            <EmailField
              value={email}
              onChange={(value) => {
                setEmail(value)
                setError(null)
              }}
              tone={error ? 'error' : undefined}
              describedBy={error ? 'forgot-error' : undefined}
              disabled={loading}
            />
            {error ? (
              <FieldMessage id="forgot-error" tone="error">
                {error}
              </FieldMessage>
            ) : null}
          </div>
          <Separator className="mt-[35px] bg-[#2f2f2f]" />
          <PrimaryButton
            type="submit"
            disabled={!enabled}
            loading={loading}
            className="mt-[14px]"
          >
            Continue
          </PrimaryButton>
        </form>
      </main>
    </div>
  )
}
