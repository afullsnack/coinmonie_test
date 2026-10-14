import { useState } from 'react'
import { Mail, MapPin, X } from 'lucide-react'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '#/components/ui/dialog'
import { PrimaryButton } from '#/components/auth/primary-button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '#/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { formatDate } from '#/components/kyb/kyb-context'
import type { Owner } from '#/components/kyb/kyb-context'

const GROUP =
  'h-[42px] rounded-[10px] border-transparent bg-[#262626] transition-colors focus-within:bg-[#2b2b2b]'
const INPUT_FIELD =
  'h-[42px] w-full rounded-[10px] bg-[#262626] px-[14px] text-sm text-[#e6e6e6] outline-none transition-colors placeholder:text-[#6b6b6b] focus:bg-[#2b2b2b]'
const INPUT = 'text-sm text-[#e6e6e6] placeholder:text-[#6b6b6b]'
const TRIGGER =
  'h-[42px] w-full justify-between rounded-[10px] border-transparent bg-[#262626] px-[14px] text-sm text-[#e6e6e6] data-[placeholder]:text-[#6b6b6b] hover:bg-[#262626] focus-visible:ring-0 open:bg-[#2b2b2b]'
const CONTENT =
  'rounded-[12px] border border-[#2f2f2f] bg-[#262626] p-[6px] text-[#e6e6e6] ring-0'
const ITEM =
  'rounded-[8px] px-[10px] py-[8px] text-sm data-highlighted:bg-[#333333]'

const COUNTRIES = [
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
]

const ROLES = ['Director', 'Team member']

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-[8px] text-sm text-[#9a9a9a]">{children}</p>
}

export function OwnerModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (owner: Owner) => void
}) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [nationality, setNationality] = useState('')
  const [address, setAddress] = useState('')
  const [ownership, setOwnership] = useState('')
  const [role, setRole] = useState('')
  const [saving, setSaving] = useState(false)

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
  const dobComplete = day.length > 0 && month.length > 0 && year.length === 4
  const enabled =
    firstName.trim() &&
    lastName.trim() &&
    emailValid &&
    dobComplete &&
    nationality &&
    address.trim() &&
    Number(ownership) > 0 &&
    role

  const close = () => {
    setFirstName('')
    setLastName('')
    setEmail('')
    setDay('')
    setMonth('')
    setYear('')
    setNationality('')
    setAddress('')
    setOwnership('')
    setRole('')
    onClose()
  }

  const save = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!enabled) return
    setSaving(true)
    // UI-only wiring: brief pending state, then add the owner.
    setTimeout(() => {
      setSaving(false)
      onSave({
        id: crypto.randomUUID(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email,
        day,
        month,
        year,
        nationality,
        address,
        ownership: `${ownership}%`,
        role,
      })
      setFirstName('')
      setLastName('')
      setEmail('')
      setDay('')
      setMonth('')
      setYear('')
      setNationality('')
      setAddress('')
      setOwnership('')
      setRole('')
    }, 800)
  }

  const countryFlag = COUNTRIES.find((c) => c.code === nationality)?.flag

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/70 backdrop-blur-md"
        className="max-h-[calc(100dvh-48px)] w-[550px] max-w-[calc(100%-48px)] gap-0 overflow-y-auto rounded-[24px] bg-[#262626] p-[28px] ring-0 sm:max-w-[550px]"
      >
        <div className="flex items-center justify-between">
          <DialogTitle className="text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
            Add director or beneficial owner
          </DialogTitle>
          <DialogClose
            render={
              <button
                type="button"
                aria-label="Close"
                className="text-[#e6e6e6] outline-none hover:text-white"
              />
            }
          >
            <X className="size-[22px]" />
          </DialogClose>
        </div>

        <form noValidate onSubmit={save}>
          <div className="mt-[24px]">
            <div className="grid grid-cols-2 gap-[8px]">
              <div>
                <FieldLabel>First name</FieldLabel>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  aria-label="First name"
                  className={INPUT_FIELD}
                />
              </div>
              <div>
                <FieldLabel>Last name</FieldLabel>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  aria-label="Last name"
                  className={INPUT_FIELD}
                />
              </div>
            </div>

            <div className="mt-[16px]">
              <FieldLabel>Email</FieldLabel>
              <InputGroup className={GROUP}>
                <InputGroupAddon>
                  <Mail aria-hidden="true" className="text-[#8a8a8a]" />
                </InputGroupAddon>
                <InputGroupInput
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  aria-label="Email"
                  className={INPUT}
                />
              </InputGroup>
            </div>

            <div className="mt-[16px]">
              <FieldLabel>Date of birth</FieldLabel>
              <div className="grid grid-cols-3 gap-[8px]">
                <input
                  value={day}
                  onChange={(e) =>
                    setDay(e.target.value.replace(/\D/g, '').slice(0, 2))
                  }
                  placeholder="dd"
                  aria-label="Day of birth"
                  inputMode="numeric"
                  className={INPUT_FIELD}
                />
                <input
                  value={month}
                  onChange={(e) =>
                    setMonth(e.target.value.replace(/\D/g, '').slice(0, 2))
                  }
                  placeholder="mm"
                  aria-label="Month of birth"
                  inputMode="numeric"
                  className={INPUT_FIELD}
                />
                <input
                  value={year}
                  onChange={(e) =>
                    setYear(e.target.value.replace(/\D/g, '').slice(0, 4))
                  }
                  placeholder="yyyy"
                  aria-label="Year of birth"
                  inputMode="numeric"
                  className={INPUT_FIELD}
                />
              </div>
              {dobComplete ? (
                <p className="mt-[8px] text-[13px] text-[#9a9a9a]">
                  {formatDate(day, month, year)}
                </p>
              ) : null}
            </div>

            <div className="mt-[16px]">
              <FieldLabel>Nationality</FieldLabel>
              <Select
                value={nationality}
                onValueChange={(v) => setNationality(String(v))}
                items={COUNTRIES.map((c) => ({
                  value: c.code,
                  label: `${c.flag} ${c.name}`,
                }))}
              >
                <SelectTrigger className={TRIGGER}>
                  {countryFlag ? (
                    <span className="text-base leading-none">
                      {countryFlag}
                    </span>
                  ) : null}
                  <SelectValue placeholder="Select nationality" />
                </SelectTrigger>
                <SelectContent className={CONTENT}>
                  {COUNTRIES.map((country) => (
                    <SelectItem
                      key={country.code}
                      value={country.code}
                      className={ITEM}
                    >
                      <span className="mr-[8px]">{country.flag}</span>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-[16px]">
              <FieldLabel>Residential address</FieldLabel>
              <InputGroup className={GROUP}>
                <InputGroupAddon>
                  <MapPin aria-hidden="true" className="text-[#8a8a8a]" />
                </InputGroupAddon>
                <InputGroupInput
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter residential address"
                  aria-label="Residential address"
                  className={INPUT}
                />
              </InputGroup>
            </div>

            <div className="mt-[16px]">
              <FieldLabel>Ownership percentage</FieldLabel>
              <InputGroup className={GROUP}>
                <InputGroupInput
                  value={ownership}
                  onChange={(e) =>
                    setOwnership(
                      e.target.value.replace(/[^\d]/g, '').slice(0, 3),
                    )
                  }
                  placeholder="How much percentage does this person have?"
                  aria-label="Ownership percentage"
                  inputMode="numeric"
                  className={INPUT}
                />
              </InputGroup>
            </div>

            <div className="mt-[16px]">
              <FieldLabel>Role</FieldLabel>
              <Select
                value={role}
                onValueChange={(v) => setRole(String(v))}
                items={ROLES.map((r) => ({ value: r, label: r }))}
              >
                <SelectTrigger className={TRIGGER}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className={CONTENT}>
                  {ROLES.map((option) => (
                    <SelectItem key={option} value={option} className={ITEM}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-[24px] flex gap-[10px]">
            <button
              type="button"
              onClick={close}
              className="h-[48px] flex-1 rounded-[12px] bg-[#2b2b2b] text-sm font-medium text-[#f5f5f5] transition-colors outline-none hover:bg-[#333333]"
            >
              Close
            </button>
            <PrimaryButton
              type="submit"
              disabled={!enabled}
              loading={saving}
              className="flex-1"
            >
              Save owner
            </PrimaryButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
