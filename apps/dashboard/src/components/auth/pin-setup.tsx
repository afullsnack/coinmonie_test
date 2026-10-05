import { useState } from 'react'

import { UnlockIllustration } from '#/components/auth/illustrations'
import { Keypad } from '#/components/auth/keypad'
import { OtpInput } from '#/components/auth/otp-input'
import { PrimaryButton } from '#/components/auth/primary-button'
import { SecondaryButton } from '#/components/settings/dialogs'
import { Separator } from '#/components/ui/separator'

const COPY = {
  create: {
    title: 'Create 6 digit PIN',
    subtitle: 'Create a secure 6 digit PIN to access your account',
  },
  reset: {
    title: 'Create new PIN',
    subtitle: 'Create a secure 6 digit PIN to access your account',
  },
} as const

/**
 * Two-step "create → confirm" PIN entry from the Create-PIN and Reset-PIN
 * designs. `onSubmit` saves the PIN and returns an error message or null.
 */
export function PinSetupForm({
  variant,
  showBack,
  onSubmit,
}: {
  variant: keyof typeof COPY
  /** Show the inline Back button on the confirm step (Create-PIN design). */
  showBack?: boolean
  onSubmit: (pin: string) => Promise<string | null>
}) {
  const [step, setStep] = useState<'create' | 'confirm'>('create')
  const [first, setFirst] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const update = (next: string) => {
    setPin(next.replace(/\D/g, '').slice(0, 6))
    setError(null)
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pin.length < 6 || loading) return
    if (step === 'create') {
      setFirst(pin)
      setPin('')
      setStep('confirm')
      return
    }
    if (pin !== first) {
      setError('PINs don’t match. Try again.')
      setPin('')
      return
    }
    setLoading(true)
    const failure = await onSubmit(pin)
    setLoading(false)
    if (failure) setError(failure)
  }

  const back = () => {
    setStep('create')
    setPin(first)
    setError(null)
  }

  return (
    <form noValidate onSubmit={submit}>
      <UnlockIllustration className="mx-auto" />
      <h1 className="mt-[24px] text-center text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
        {step === 'create' ? COPY[variant].title : 'Confirm 6 digit PIN'}
      </h1>
      <p className="mt-[10px] text-center text-sm text-[#9a9a9a]">
        {step === 'create' ? COPY[variant].subtitle : 'Re-enter your 6 digit PIN'}
      </p>

      <Separator className="mt-[20px] bg-[#2f2f2f]" />
      <div className="mt-[13px] flex justify-center">
        <OtpInput
          key={step}
          value={pin}
          onChange={update}
          error={Boolean(error)}
          disabled={loading}
          label={step === 'create' ? 'New PIN' : 'Confirm PIN'}
          autoFocus
        />
      </div>
      {error ? (
        <p role="alert" className="mt-[10px] text-center text-[13px] text-[#e5484d]">
          {error}
        </p>
      ) : null}
      <Separator className="mt-[13px] bg-[#2f2f2f]" />

      <div className="mt-[24px]">
        <Keypad disabled={loading} onDigit={(digit) => update(pin + digit)} onBackspace={() => update(pin.slice(0, -1))} />
      </div>
      <div className="mt-[16px] flex gap-2">
        {showBack && step === 'confirm' ? (
          <SecondaryButton className="h-[48px] flex-none rounded-[14px] px-6" onClick={back}>
            Back
          </SecondaryButton>
        ) : null}
        <PrimaryButton type="submit" disabled={pin.length < 6} loading={loading} className="flex-1">
          {step === 'create' ? 'Continue' : 'Create PIN'}
        </PrimaryButton>
      </div>
    </form>
  )
}
