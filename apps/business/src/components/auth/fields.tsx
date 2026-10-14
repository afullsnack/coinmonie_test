import { useState } from 'react'
import { Eye, EyeOff, KeyRound, Mail } from 'lucide-react'
import { cn } from 'cn'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '#/components/ui/input-group'

export type FieldTone = 'error' | 'warning' | 'success'

const GROUP =
  'h-[48px] rounded-[14px] border border-transparent bg-[#262626] transition-colors focus-within:bg-[#2b2b2b]'
const TONE_GROUP: Record<FieldTone, string> = {
  error: 'border-[#e5484d] ring-[3px] ring-[#e5484d]/15 focus-within:bg-[#262626]',
  warning: 'border-[#f3b13b] ring-[3px] ring-[#f3b13b]/15 focus-within:bg-[#262626]',
  success: 'border-[#30a46c] ring-[3px] ring-[#30a46c]/15 focus-within:bg-[#262626]',
}
const INPUT = 'text-sm text-[#e6e6e6] placeholder:text-[#6b6b6b]'

type FieldProps = {
  value: string
  onChange: (v: string) => void
  tone?: FieldTone
  id?: string
  name?: string
  disabled?: boolean
  describedBy?: string
}

export function TextField({
  value,
  onChange,
  tone,
  placeholder,
  label,
  autoComplete,
  id,
  name,
  disabled,
  describedBy,
  className,
}: FieldProps & { placeholder: string; label: string; autoComplete?: string; className?: string }) {
  return (
    <InputGroup className={cn(GROUP, tone && TONE_GROUP[tone], className)}>
      <InputGroupInput
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        aria-invalid={tone === 'error' || undefined}
        aria-describedby={describedBy}
        autoComplete={autoComplete}
        className={cn(INPUT, 'px-4')}
      />
    </InputGroup>
  )
}

export function EmailField({
  value,
  onChange,
  tone,
  id,
  name = 'email',
  disabled,
  describedBy,
}: FieldProps) {
  return (
    <InputGroup className={cn(GROUP, tone && TONE_GROUP[tone])}>
      <InputGroupAddon>
        <Mail aria-hidden="true" className="text-[#8a8a8a]" />
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        name={name}
        type="email"
        inputMode="email"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter email address"
        aria-label="Email address"
        aria-invalid={tone === 'error' || undefined}
        aria-describedby={describedBy}
        autoComplete="email"
        className={cn(INPUT, tone === 'error' && 'text-[#e5484d] caret-[#e5484d]')}
      />
    </InputGroup>
  )
}

export function PasswordField({
  value,
  onChange,
  tone,
  id,
  name = 'password',
  disabled,
  describedBy,
  autoComplete = 'current-password',
  placeholder = 'Enter password',
  label = 'Password',
}: FieldProps & {
  autoComplete?: string
  placeholder?: string
  label?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <InputGroup className={cn(GROUP, tone && TONE_GROUP[tone])}>
      <InputGroupAddon>
        <KeyRound aria-hidden="true" className="text-[#8a8a8a]" />
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        name={name}
        type={show ? 'text' : 'password'}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        aria-invalid={tone === 'error' || undefined}
        aria-describedby={describedBy}
        autoComplete={autoComplete}
        className={`${INPUT} tracking-[0.06em] placeholder:tracking-normal`}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          aria-label={show ? 'Hide password' : 'Show password'}
          onClick={() => setShow((v) => !v)}
          className="text-[#8a8a8a] hover:text-[#b5b5b5]"
        >
          {show ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

const TONE_TEXT: Record<FieldTone, string> = {
  error: 'text-[#e5484d]',
  warning: 'text-[#f3b13b]',
  success: 'text-[#30a46c]',
}

/** Helper / error text rendered under a field. */
export function FieldMessage({
  id,
  tone,
  children,
}: {
  id?: string
  tone: FieldTone
  children: React.ReactNode
}) {
  return (
    <p id={id} role={tone === 'error' ? 'alert' : undefined} className={cn('mt-[8px] text-[13px]', TONE_TEXT[tone])}>
      {children}
    </p>
  )
}
