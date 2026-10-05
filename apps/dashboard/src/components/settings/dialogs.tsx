import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { CircleAlert, X } from 'lucide-react'
import { cn } from 'cn'

import { FieldMessage, PasswordField } from '#/components/auth/fields'
import { PadlockIllustration } from '#/components/auth/illustrations'
import { Keypad } from '#/components/auth/keypad'
import { OtpInput } from '#/components/auth/otp-input'
import { PrimaryButton } from '#/components/auth/primary-button'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '#/components/ui/dialog'
import { Separator } from '#/components/ui/separator'

const SURFACE =
  'w-[400px] gap-0 rounded-[22px] bg-[#1c1c1c] p-4 text-center text-[#f5f5f5] ring-0 sm:max-w-[400px]'
const OVERLAY = 'bg-black/60 backdrop-blur-md'

export function DialogShell({
  open,
  onClose,
  className,
  children,
}: {
  open: boolean
  onClose: () => void
  className?: string
  children: React.ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent showCloseButton={false} overlayClassName={OVERLAY} className={cn(SURFACE, className)}>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#e8e8e8] outline-none hover:text-white"
        >
          <X className="size-5" />
        </button>
        {children}
      </DialogContent>
    </Dialog>
  )
}

export function SecondaryButton({
  className,
  ...props
}: React.ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        'h-12 flex-1 rounded-[12px] bg-[#2a2a2a] text-sm font-medium text-white outline-none hover:bg-[#333]',
        className,
      )}
      {...props}
    />
  )
}

export function DangerButton({
  className,
  ...props
}: React.ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        'h-12 flex-1 rounded-[12px] bg-[#c42026] text-sm font-medium text-white outline-none hover:bg-[#d4282e]',
        className,
      )}
      {...props}
    />
  )
}

export function WarningNote({ children }: { children: React.ReactNode }) {
  return (
    <Alert className="mt-5 rounded-[12px] border-0 bg-[#3a3218] px-3 py-2.5 text-left">
      <CircleAlert className="fill-[#f0c14b] text-[#3a3218]!" />
      <AlertDescription className="text-[13px] leading-snug text-[#a8a08a] [&_b]:font-medium [&_b]:text-[#f0f0f0]">
        {children}
      </AlertDescription>
    </Alert>
  )
}

export function ConfirmDialog({
  open,
  art,
  title,
  description,
  warning,
  cancelLabel = 'No',
  confirmLabel,
  destructive,
  error,
  loading,
  onCancel,
  onConfirm,
}: {
  open: boolean
  art?: React.ReactNode
  title: React.ReactNode
  description: React.ReactNode
  warning?: React.ReactNode
  cancelLabel?: string
  confirmLabel: string
  destructive?: boolean
  error?: string | null
  loading?: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <DialogShell open={open} onClose={onCancel} className="pt-10">
      {art ? <div className="mx-auto mb-3">{art}</div> : null}
      <DialogTitle className="text-lg font-semibold text-white">{title}</DialogTitle>
      <DialogDescription className="mt-1 text-[13px] text-[#8d8d8d] [&_b]:font-medium [&_b]:text-[#f0f0f0]">
        {description}
      </DialogDescription>
      {warning ? <WarningNote>{warning}</WarningNote> : null}
      {error ? (
        <p role="alert" className="mt-3 text-xs text-[#e5484d]">
          {error}
        </p>
      ) : null}
      <div className="mt-6 flex gap-2">
        <SecondaryButton onClick={onCancel}>{cancelLabel}</SecondaryButton>
        {destructive ? (
          <DangerButton onClick={onConfirm} disabled={loading}>
            {loading ? 'Please wait…' : confirmLabel}
          </DangerButton>
        ) : (
          <PrimaryButton type="button" className="flex-1" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </PrimaryButton>
        )}
      </div>
    </DialogShell>
  )
}

/** Re-enter the account password before a security change (2FA on/off). */
export function PasswordConfirmDialog({
  open,
  title = 'Confirm with your password',
  description = 'Enter your password to continue.',
  confirmLabel = 'Continue',
  error,
  loading,
  onClose,
  onChange,
  onConfirm,
}: {
  open: boolean
  title?: string
  description?: string
  confirmLabel?: string
  error?: string | null
  loading?: boolean
  onClose: () => void
  onChange?: () => void
  onConfirm: (password: string) => void
}) {
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (open) setPassword('')
  }, [open])

  return (
    <DialogShell open={open} onClose={onClose} className="pt-10">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (password && !loading) onConfirm(password)
        }}
      >
        <PadlockIllustration className="mx-auto h-12" />
        <DialogTitle className="mt-3 text-lg font-semibold text-white">{title}</DialogTitle>
        <DialogDescription className="mt-1 text-[13px] text-[#8d8d8d]">{description}</DialogDescription>
        <div className="mt-5 text-left">
          <PasswordField
            value={password}
            onChange={(value) => {
              setPassword(value)
              onChange?.()
            }}
            tone={error ? 'error' : undefined}
            describedBy={error ? 'password-confirm-error' : undefined}
            disabled={loading}
          />
          {error ? (
            <FieldMessage id="password-confirm-error" tone="error">
              {error}
            </FieldMessage>
          ) : null}
        </div>
        <div className="mt-6 flex gap-2">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton type="submit" className="flex-1" disabled={!password} loading={loading}>
            {confirmLabel}
          </PrimaryButton>
        </div>
      </form>
    </DialogShell>
  )
}

export function PinDialog({
  open,
  title,
  description,
  confirmLabel,
  reveal,
  forgotLink,
  error,
  loading,
  onBack,
  onClose,
  onChange,
  onComplete,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  reveal?: boolean
  forgotLink?: boolean
  error?: string | null
  loading?: boolean
  onBack?: () => void
  onClose: () => void
  /** Fires on every edit, e.g. to clear a server error. */
  onChange?: () => void
  onComplete: (pin: string) => void
}) {
  const navigate = useNavigate()
  const [pin, setPin] = useState('')

  useEffect(() => {
    if (open) setPin('')
  }, [open, title])

  const update = (next: string) => {
    setPin(next.replace(/\D/g, '').slice(0, 6))
    onChange?.()
  }

  return (
    <DialogShell open={open} onClose={onClose} className="pt-8">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (pin.length === 6 && !loading) onComplete(pin)
        }}
      >
        <PadlockIllustration className="mx-auto h-12" />
        <DialogTitle className="mt-3 text-lg font-semibold text-white">{title}</DialogTitle>
        <DialogDescription className="mt-1 text-[13px] text-[#8d8d8d]">{description}</DialogDescription>
        <Separator className="my-4 bg-[#2c2c2c]" />
        <div className="flex justify-center">
          <OtpInput value={pin} onChange={update} masked={!reveal} error={Boolean(error)} label="PIN" disabled={loading} />
        </div>
        {error ? (
          <p role="alert" className="mt-3 text-xs text-[#e5484d]">
            {error}
          </p>
        ) : null}
        {forgotLink ? (
          <button
            type="button"
            onClick={() => {
              onClose()
              navigate({ to: '/forgot-pin' })
            }}
            className="mt-3 block w-full text-xs text-[#d0d0d0] outline-none hover:text-white"
          >
            Forgot PIN
          </button>
        ) : null}
        <Separator className="my-4 bg-[#2c2c2c]" />
        <Keypad
          disabled={loading}
          onDigit={(digit) => update(pin + digit)}
          onBackspace={() => update(pin.slice(0, -1))}
        />
        <div className="mt-5 flex gap-2">
          {onBack ? (
            <SecondaryButton className="flex-none px-4" onClick={onBack}>
              Back
            </SecondaryButton>
          ) : null}
          <PrimaryButton type="submit" className="flex-1" disabled={pin.length < 6} loading={loading}>
            {confirmLabel}
          </PrimaryButton>
        </div>
      </form>
    </DialogShell>
  )
}

export function CodeDialog({
  open,
  art,
  title,
  description,
  confirmLabel,
  footer,
  error,
  loading,
  onBack,
  onClose,
  onChange,
  onComplete,
}: {
  open: boolean
  art: React.ReactNode
  title: string
  description: React.ReactNode
  confirmLabel: string
  footer?: React.ReactNode
  error?: string | null
  loading?: boolean
  onBack?: () => void
  onClose: () => void
  onChange?: () => void
  onComplete: (code: string) => void
}) {
  const [code, setCode] = useState('')

  useEffect(() => {
    if (open) setCode('')
  }, [open])

  return (
    <DialogShell open={open} onClose={onClose} className="pt-10">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (code.length === 6 && !loading) onComplete(code)
        }}
      >
        <div className="mx-auto w-fit">{art}</div>
        <DialogTitle className="mt-3 text-lg font-semibold text-white">{title}</DialogTitle>
        <DialogDescription className="mx-auto mt-1 max-w-[260px] text-[13px] text-[#8d8d8d] [&_b]:font-medium [&_b]:text-[#f0f0f0]">
          {description}
        </DialogDescription>
        <div className="mt-4 flex justify-center">
          <OtpInput
            value={code}
            onChange={(next) => {
              setCode(next.replace(/\D/g, ''))
              onChange?.()
            }}
            error={Boolean(error)}
            disabled={loading}
            autoFocus
          />
        </div>
        {error ? (
          <p role="alert" className="mt-3 text-xs text-[#e5484d]">
            {error}
          </p>
        ) : null}
        {footer}
        <div className="mt-6 flex gap-2">
          {onBack ? <SecondaryButton onClick={onBack}>Back</SecondaryButton> : null}
          <PrimaryButton type="submit" className="flex-1" disabled={code.length < 6} loading={loading}>
            {confirmLabel}
          </PrimaryButton>
        </div>
      </form>
    </DialogShell>
  )
}
