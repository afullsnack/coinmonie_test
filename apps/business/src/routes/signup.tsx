import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { cn } from 'cn'

import { AuthShell } from '#/components/auth/auth-shell'
import { EmailField, FieldMessage, PasswordField, TextField } from '#/components/auth/fields'
import type { FieldTone } from '#/components/auth/fields'
import { CoinLogo } from '#/components/auth/illustrations'
import { PrimaryButton } from '#/components/auth/primary-button'
import { Checkbox } from '#/components/ui/checkbox'
import { Separator } from '#/components/ui/separator'
import { authClient } from '#/lib/auth-client'
import { redirectIfSignedIn } from '#/lib/session'
import { EMAIL_RE, PASSWORD_HINT, passwordStrength, signUpSchema } from '#/lib/validation'
import type { PasswordStrength } from '#/lib/validation'

export const Route = createFileRoute('/signup')({
  beforeLoad: redirectIfSignedIn,
  head: () => ({ meta: [{ title: 'Sign up · CoinMonie' }] }),
  component: Signup,
})

const STRENGTH_TONE: Record<PasswordStrength, FieldTone> = {
  weak: 'error',
  fair: 'warning',
  strong: 'success',
}
const STRENGTH_SEGMENTS: Record<PasswordStrength, number> = { weak: 1, fair: 2, strong: 3 }
const SEGMENT_COLOR: Record<FieldTone, string> = {
  error: 'bg-[#e5484d]',
  warning: 'bg-[#f3b13b]',
  success: 'bg-[#30a46c]',
}
const LINK = 'text-[#f5f5f5] underline decoration-[#f5f5f5] underline-offset-[3px] hover:text-white'

function Signup() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const strength = passwordStrength(password)
  const strengthTone = strength ? STRENGTH_TONE[strength] : undefined
  const invalidEmail = emailTouched && email !== '' && !EMAIL_RE.test(email.trim())
  const shownEmailError = emailError ?? (invalidEmail ? 'This email isn’t correct' : null)
  const values = { firstName, lastName, email, password }
  const enabled = signUpSchema.safeParse(values).success && agree

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!enabled || loading) return
    const parsed = signUpSchema.parse(values)
    setLoading(true)
    setFormError(null)
    const { error } = await authClient.signUp.email({
      name: `${parsed.firstName} ${parsed.lastName}`,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email,
      password: parsed.password,
    })
    setLoading(false)
    if (error) {
      if (error.code === 'USER_ALREADY_EXISTS' || error.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
        setEmailError('An account with this email already exists')
      } else if (error.code?.includes('EMAIL')) {
        setEmailError('This email isn’t correct')
      } else {
        setFormError(error.message || 'We couldn’t create your account. Try again.')
      }
      return
    }
    navigate({ to: '/account-created', search: { email: parsed.email } })
  }

  return (
    <AuthShell
      footer={
        <p className="mt-[24px] text-center text-sm text-[#9a9a9a]">
          Already have an account?{' '}
          <Link to="/signin" className={LINK}>
            Sign in
          </Link>
        </p>
      }
    >
      <CoinLogo />
      <h1 className="mt-[24px] text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
        Welcome to CoinMonie
      </h1>
      <p className="mt-[10px] text-sm text-[#9a9a9a]">Accept stablecoins. Pay anyone. Manage your money.</p>

      <form noValidate onSubmit={submit}>
        <div className="mt-[37px] grid grid-cols-2 gap-[2px]">
          <TextField
            name="firstName"
            value={firstName}
            onChange={setFirstName}
            placeholder="Enter first name"
            label="First name"
            autoComplete="given-name"
            disabled={loading}
            className="rounded-r-[4px]"
          />
          <TextField
            name="lastName"
            value={lastName}
            onChange={setLastName}
            placeholder="Enter last name"
            label="Last name"
            autoComplete="family-name"
            disabled={loading}
            className="rounded-l-[4px]"
          />
        </div>

        <div className="mt-[12px]" onBlur={() => setEmailTouched(true)}>
          <EmailField
            value={email}
            onChange={(value) => {
              setEmail(value)
              setEmailError(null)
            }}
            tone={shownEmailError ? 'error' : undefined}
            describedBy={shownEmailError ? 'signup-email-error' : undefined}
            disabled={loading}
          />
          {shownEmailError ? (
            <FieldMessage id="signup-email-error" tone="error">
              {shownEmailError}
            </FieldMessage>
          ) : null}
        </div>

        <div className="mt-[12px]">
          <PasswordField
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            tone={strengthTone}
            describedBy={strength ? 'signup-password-hint' : undefined}
            disabled={loading}
          />
          {strength && strengthTone ? (
            <>
              <div className="mt-[10px] flex gap-[3px]" aria-hidden="true">
                {Array.from({ length: 3 }, (_, i) => (
                  <span
                    key={i}
                    className={cn(
                      'h-[2px] flex-1 rounded-full',
                      i < STRENGTH_SEGMENTS[strength] ? SEGMENT_COLOR[strengthTone] : 'bg-[#3a3a3a]',
                    )}
                  />
                ))}
              </div>
              <FieldMessage id="signup-password-hint" tone={strengthTone}>
                {PASSWORD_HINT[strength]}
              </FieldMessage>
            </>
          ) : null}
        </div>

        {formError ? (
          <FieldMessage tone="error">{formError}</FieldMessage>
        ) : null}

        <Separator className="mt-[32px] bg-[#2f2f2f]" />

        <PrimaryButton type="submit" disabled={!enabled} loading={loading} className="mt-[13px]">
          Create account
        </PrimaryButton>

        <div className="mt-[16px] flex items-center justify-center gap-[9px] text-sm text-[#9a9a9a]">
          <Checkbox
            id="signup-terms"
            checked={agree}
            onCheckedChange={(checked) => setAgree(checked === true)}
            className="size-[18px] rounded-[5px] border-[#4a4a4a] bg-transparent hover:border-[#6b6b6b] data-checked:border-transparent data-checked:bg-[#f5f5f5] data-checked:text-[#1a1a1a] hover:data-checked:bg-white [&_svg]:size-[12px] [&_svg]:stroke-[3]"
          />
          <label htmlFor="signup-terms">
            I agree to the{' '}
            <a href="/terms" target="_blank" rel="noreferrer" className={LINK}>
              terms
            </a>{' '}
            and{' '}
            <a href="/privacy" target="_blank" rel="noreferrer" className={LINK}>
              privacy policy
            </a>
          </label>
        </div>
      </form>
    </AuthShell>
  )
}
