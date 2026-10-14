import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { MapPin } from 'lucide-react'

import { BankIllustration } from '#/components/kyb/illustrations'
import { KybFooter } from '#/components/kyb/kyb-footer'
import { useKyb } from '#/components/kyb/kyb-context'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

export const Route = createFileRoute('/kyb/business-details')({
  component: BusinessDetails,
})

const GROUP =
  'h-[42px] rounded-[10px] border-transparent bg-[#262626] transition-colors focus-within:bg-[#2b2b2b]'
const INPUT_FIELD =
  'h-[42px] w-full rounded-[10px] bg-[#262626] px-[14px] text-sm text-[#e6e6e6] outline-none transition-colors placeholder:text-[#6b6b6b] focus:bg-[#2b2b2b]'
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
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
]

const BUSINESS_TYPES = [
  'Private Limited Company',
  'Public Limited Company',
  'Sole Proprietorship',
  'Partnership',
]
const INDUSTRIES = [
  'Financial technology',
  'E-commerce',
  'Logistics',
  'Healthcare',
  'Education',
  'Agriculture',
]

function BusinessDetails() {
  const navigate = useNavigate()
  const { details, setDetails } = useKyb()
  const [saving, setSaving] = useState(false)

  const enabled =
    details.legalName.trim() &&
    details.countryCode &&
    details.registrationNumber.trim() &&
    details.businessType &&
    details.industry &&
    details.address.trim() &&
    details.city.trim() &&
    details.state.trim() &&
    details.postalCode.trim()

  const country = COUNTRIES.find((c) => c.code === details.countryCode)

  const submit = () => {
    if (!enabled) return
    setSaving(true)
    // UI-only wiring: brief pending state, then the next step.
    setTimeout(() => navigate({ to: '/kyb/directors-and-ubos' }), 900)
  }

  return (
    <div>
      <BankIllustration />
      <h1 className="mt-[24px] text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
        Tell us about your business
      </h1>
      <p className="mt-[10px] text-sm text-[#9a9a9a]">
        We use this to verify your company with local registries. It should
        match your official registration.
      </p>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <div className="mt-[28px] flex flex-col gap-4">
          <input
            value={details.legalName}
            onChange={(e) => setDetails({ legalName: e.target.value })}
            placeholder="Legal business name"
            aria-label="Legal business name"
            className={INPUT_FIELD}
          />

          <div className="flex gap-[2px]">
            <Select
              value={details.countryCode}
              onValueChange={(v) =>
                setDetails({
                  countryCode: String(v),
                  country: COUNTRIES.find((c) => c.code === v)?.name ?? '',
                })
              }
              items={COUNTRIES.map((c) => ({
                value: c.code,
                label: `${c.flag} ${c.name}`,
              }))}
            >
              <SelectTrigger className={`${TRIGGER} w-[92px] shrink-0`}>
                <span className="text-base leading-none">
                  {country?.flag ?? '🇳🇬'}
                </span>
                <SelectValue placeholder="NG" />
              </SelectTrigger>
              <SelectContent className={CONTENT}>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code} className={ITEM}>
                    <span className="mr-[8px]">{c.flag}</span>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              value={details.country}
              onChange={(e) => setDetails({ country: e.target.value })}
              placeholder="Country of incorporation"
              aria-label="Country of incorporation"
              className={`${GROUP} flex flex-1 items-center px-[14px] text-sm outline-none`}
            />
          </div>

          <input
            value={details.registrationNumber}
            onChange={(e) => setDetails({ registrationNumber: e.target.value })}
            placeholder="Registration number"
            aria-label="Registration number"
            className={INPUT_FIELD}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              value={details.businessType}
              onValueChange={(v) => setDetails({ businessType: String(v) })}
              items={BUSINESS_TYPES.map((t) => ({ value: t, label: t }))}
            >
              <SelectTrigger className={TRIGGER}>
                <SelectValue placeholder="Business type" />
              </SelectTrigger>
              <SelectContent className={CONTENT}>
                {BUSINESS_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className={ITEM}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={details.industry}
              onValueChange={(v) => setDetails({ industry: String(v) })}
              items={INDUSTRIES.map((i) => ({ value: i, label: i }))}
            >
              <SelectTrigger className={TRIGGER}>
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent className={CONTENT}>
                {INDUSTRIES.map((i) => (
                  <SelectItem key={i} value={i} className={ITEM}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div
            className={`${GROUP} flex w-full items-center gap-[10px] px-[14px]`}
          >
            <MapPin
              aria-hidden="true"
              className="size-4 shrink-0 text-[#8a8a8a]"
            />
            <input
              value={details.address}
              onChange={(e) => setDetails({ address: e.target.value })}
              placeholder="Registered address"
              aria-label="Registered address"
              className="w-full bg-transparent text-sm text-[#e6e6e6] outline-none placeholder:text-[#6b6b6b]"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <input
              value={details.city}
              onChange={(e) => setDetails({ city: e.target.value })}
              placeholder="City"
              aria-label="City"
              className={INPUT_FIELD}
            />
            <input
              value={details.state}
              onChange={(e) => setDetails({ state: e.target.value })}
              placeholder="State / Region"
              aria-label="State / Region"
              className={INPUT_FIELD}
            />
            <input
              value={details.postalCode}
              onChange={(e) => setDetails({ postalCode: e.target.value })}
              placeholder="Postal code"
              aria-label="Postal code"
              className={INPUT_FIELD}
            />
          </div>
        </div>

        <KybFooter
          leftLabel="Cancel"
          onLeft={() => navigate({ to: '/' })}
          rightLabel="Continue"
          rightEnabled={Boolean(enabled)}
          rightLoading={saving}
          onRight={submit}
        />
      </form>
    </div>
  )
}
