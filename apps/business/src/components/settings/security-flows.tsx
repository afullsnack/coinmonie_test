import { useEffect, useState } from 'react'
import { Copy, Monitor } from 'lucide-react'
import QRCode from 'react-qr-code'

import { PrimaryButton } from '#/components/auth/primary-button'
import { KeyIllustration } from '#/components/dashboard/illustrations'
import { CodeDialog, DialogShell, SecondaryButton } from '#/components/settings/dialogs'
import { FIELD } from '#/components/settings/settings-ui'
import { DialogDescription, DialogTitle } from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Separator } from '#/components/ui/separator'
import { authClient, authErrorMessage } from '#/lib/auth-client'

type TwoFactorStep = 'setup' | 'code' | null

/** Base32 secret from an `otpauth://` URI, grouped in fours for typing. */
function manualKey(totpURI: string) {
  const secret = new URL(totpURI).searchParams.get('secret') ?? ''
  return secret.replace(/(.{4})/g, '$1 ').trim()
}

/**
 * Authenticator setup after `twoFactor.enable`: scan the QR (or copy the
 * key), then confirm a code, which turns 2FA on.
 */
export function TwoFactorFlow({
  step,
  totpURI,
  onStep,
  onActivated,
}: {
  step: TwoFactorStep
  totpURI: string | null
  onStep: (step: TwoFactorStep) => void
  onActivated: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const key = totpURI ? manualKey(totpURI) : ''

  useEffect(() => {
    if (step === null) {
      setCopied(false)
      setError(null)
    }
  }, [step])

  return (
    <>
      <DialogShell open={step === 'setup'} onClose={() => onStep(null)} className="pt-10 text-left">
        <DialogTitle className="text-lg font-semibold text-white">Two-factor authentication</DialogTitle>
        <DialogDescription className="mt-1 text-[13px] text-[#8d8d8d]">
          2FA adds an extra layer of security to your account by generating a secure code on your device for
          approving transactions.
        </DialogDescription>
        <Separator className="my-4 bg-[#2a2a2a]" />
        <Step index={1}>
          You need an authenticator to setup two-factor. Download and setup{' '}
          <a
            href="https://support.google.com/accounts/answer/1066447"
            target="_blank"
            rel="noreferrer"
            className="text-[#f0f0f0] underline underline-offset-2"
          >
            Google Authenticator
          </a>
        </Step>
        <Separator className="my-4 bg-[#2a2a2a]" />
        <Step index={2}>
          From your device, launch Google Authenticator, and scan the QR Code below.
          {totpURI ? (
            <QRCode
              value={totpURI}
              size={88}
              bgColor="transparent"
              fgColor="#e8e8e8"
              title="Two-factor setup QR code"
              className="mt-3 block"
            />
          ) : null}
          <span className="mt-4 flex items-center gap-2 text-xs text-[#e8e8e8]">
            To set up manually
            <span className="h-px flex-1 bg-[#2a2a2a]" />
          </span>
          <span className="mt-3 block">
            Tap to copy the key above and paste it in your authenticator to start generating tokens
          </span>
          <span className="mt-2 flex min-h-10 items-center justify-between gap-3 rounded-[10px] bg-[#2a2a2a] px-3 py-2 text-sm text-[#f0f0f0]">
            <code className="font-sans break-all">{key}</code>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard?.writeText(key.replace(/\s/g, ''))
                setCopied(true)
              }}
              className="flex shrink-0 items-center gap-1 text-xs text-[#d0d0d0] outline-none hover:text-white"
            >
              <Copy className="size-3" />
              {copied ? 'Copied' : 'Copy'}
            </button>
          </span>
        </Step>
        <PrimaryButton type="button" className="mt-5" onClick={() => onStep('code')}>
          Continue, Enter 2FA code
        </PrimaryButton>
      </DialogShell>

      <CodeDialog
        open={step === 'code'}
        art={<KeyIllustration />}
        title="Enter 2FA code"
        description="Enter the 6-digit code generated for Coinmonie from your authenticator app."
        confirmLabel="Continue"
        error={error}
        loading={loading}
        onBack={() => onStep('setup')}
        onChange={() => setError(null)}
        onClose={() => onStep(null)}
        onComplete={async (code) => {
          setLoading(true)
          const { error: failure } = await authClient.twoFactor.verifyTotp({ code })
          setLoading(false)
          if (failure) {
            setError(authErrorMessage(failure, 'The code entered is wrong. Try again.'))
            return
          }
          onStep(null)
          onActivated()
        }}
      />
    </>
  )
}

function Step({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 text-[13px] text-[#8d8d8d]">
      <span className="text-base text-[#f0f0f0]">{index}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

type PasskeyStep = 'name' | 'code' | 'done' | null

const RESEND_SECONDS = 60

/**
 * Name the passkey, confirm with the code emailed to the account, then let
 * the browser create the WebAuthn credential.
 */
export function PasskeyFlow({
  step,
  email,
  onStep,
  onCreated,
}: {
  step: PasskeyStep
  email: string
  onStep: (step: PasskeyStep) => void
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resendAt, setResendAt] = useState(0)

  useEffect(() => {
    if (step === null) {
      setName('')
      setError(null)
    }
  }, [step])

  const sendCode = async () => {
    setError(null)
    setResendAt(Date.now() + RESEND_SECONDS * 1000)
    const { error: failure } = await authClient.emailOtp.sendVerificationOtp({ email, type: 'sign-in' })
    if (failure) setError(authErrorMessage(failure, 'We couldn’t send the code. Try again shortly.'))
  }

  return (
    <>
      <DialogShell open={step === 'name'} onClose={() => onStep(null)} className="pt-10">
        <KeyIllustration className="mx-auto" />
        <DialogTitle className="mt-3 text-lg font-semibold text-white">Enable passkey</DialogTitle>
        <DialogDescription className="mt-1 text-[13px] text-[#8d8d8d]">
          Create a secure password-free way to sign in and verify your identity.
        </DialogDescription>
        <form
          className="mt-5 text-left"
          onSubmit={(event) => {
            event.preventDefault()
            if (!name.trim()) return
            onStep('code')
            void sendCode()
          }}
        >
          <Label htmlFor="passkey-name" className="text-xs font-normal text-[#8d8d8d]">
            Passkey name
          </Label>
          <Input
            id="passkey-name"
            autoFocus
            maxLength={60}
            value={name}
            placeholder="Enter passkey name e.g personal passkey"
            onChange={(event) => setName(event.target.value)}
            className={`${FIELD} mt-2 h-11 rounded-[12px]`}
          />
          <div className="mt-5 flex gap-2">
            <SecondaryButton onClick={() => onStep(null)}>Cancel</SecondaryButton>
            <PrimaryButton type="submit" className="flex-1" disabled={!name.trim()}>
              Create passkey
            </PrimaryButton>
          </div>
        </form>
      </DialogShell>

      <CodeDialog
        open={step === 'code'}
        art={<KeyIllustration />}
        title="Confirm it’s you"
        description={
          <>
            We&apos;ve sent a 6-digit code to <b>{email}</b>
          </>
        }
        confirmLabel="Verify & Create Passkey"
        error={error}
        loading={loading}
        footer={
          <p className="mt-3 text-xs text-[#8d8d8d]">
            Didn&apos;t receive the code?{' '}
            <button
              type="button"
              onClick={() => {
                if (Date.now() >= resendAt) void sendCode()
              }}
              className="text-[#f0f0f0] underline underline-offset-4 outline-none"
            >
              Resend it
            </button>
          </p>
        }
        onBack={() => onStep('name')}
        onChange={() => setError(null)}
        onClose={() => onStep(null)}
        onComplete={async (otp) => {
          setLoading(true)
          const check = await authClient.emailOtp.checkVerificationOtp({ email, type: 'sign-in', otp })
          if (check.error) {
            setLoading(false)
            setError(authErrorMessage(check.error, 'The code entered is wrong. Try again.'))
            return
          }
          const created = await authClient.passkey.addPasskey({ name: name.trim() })
          setLoading(false)
          if (created?.error) {
            setError(authErrorMessage(created.error, 'Passkey creation was cancelled.'))
            return
          }
          onCreated()
          onStep('done')
        }}
      />

      <DialogShell open={step === 'done'} onClose={() => onStep(null)} className="pt-10">
        <span className="relative mx-auto block w-fit">
          <Monitor className="mx-auto size-10 fill-[#e8e8e8] text-[#e8e8e8]" />
          <span className="absolute -right-1 bottom-0 flex size-4 items-center justify-center rounded-full bg-[#30c463] text-[9px] font-bold text-white">
            ✓
          </span>
        </span>
        <DialogTitle className="mt-3 text-lg font-semibold text-white">Device connected</DialogTitle>
        <DialogDescription className="mt-1 text-[13px] text-[#8d8d8d]">Your passkey is ready to use</DialogDescription>
        <PrimaryButton type="button" className="mt-5" onClick={() => onStep(null)}>
          Close
        </PrimaryButton>
      </DialogShell>
    </>
  )
}
