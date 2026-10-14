import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { CircleAlert, CircleCheck, Mail, MapPin, Trash2 } from 'lucide-react'
import { cn } from 'cn'
import { z } from 'zod'

import { PrimaryButton } from '#/components/auth/primary-button'
import { TopToast } from '#/components/money/chrome'
import { ConfirmDialog } from '#/components/settings/dialogs'
import {
  ChevronPill,
  FIELD,
  IconInput,
  SectionTitle,
  SettingsDivider,
  SettingsRow,
} from '#/components/settings/settings-ui'
import { Input } from '#/components/ui/input'
import { authClient } from '#/lib/auth-client'
import { updateRememberedAccount } from '#/lib/last-account'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

const searchSchema = z.object({
  kyb: z.enum(['verified', 'review']).optional(),
})

export const Route = createFileRoute('/_app/settings/profile')({
  validateSearch: searchSchema,
  component: ProfileSettings,
})

const COUNTRIES = [
  { code: 'NG', flag: '🇳🇬', name: 'Nigeria' },
  { code: 'GH', flag: '🇬🇭', name: 'Ghana' },
  { code: 'KE', flag: '🇰🇪', name: 'Kenya' },
  { code: 'ZA', flag: '🇿🇦', name: 'South Africa' },
]

const COMPANY_TYPES = ['Private Limited Company', 'Public Limited Company', 'Sole Proprietorship', 'Partnership']
const INDUSTRIES = ['Financial technology', 'E-commerce', 'Logistics', 'Healthcare', 'Education']

const BUSINESS = {
  name: 'Coinmonie Technologies',
  country: 'NG',
  rc: 'RC 1948220',
  type: COMPANY_TYPES[0],
  industry: INDUSTRIES[0],
  address: 'No.3 Queens street, Phase IV',
  city: 'Kubwa',
  state: 'FCT, Abuja',
  postal: '901101',
}

const SELECT_TRIGGER =
  'h-10 w-full justify-between rounded-[10px] border-0 bg-[#2a2a2a] px-3 text-sm text-[#f0f0f0] hover:bg-[#2a2a2a] focus-visible:ring-0 dark:bg-[#2a2a2a] dark:hover:bg-[#2a2a2a]'
const SELECT_CONTENT = 'rounded-[12px] border border-[#2f2f2f] bg-[#262626] p-1 text-[#e6e6e6] ring-0'
const SELECT_ITEM = 'rounded-[8px] px-2.5 py-2 text-sm data-highlighted:bg-[#333]'

function ProfileSettings() {
  const { kyb = 'verified' } = Route.useSearch()
  const { session } = Route.useRouteContext()
  const initialPersonal = {
    firstName: session.user.firstName ?? session.user.name.split(' ')[0] ?? '',
    lastName: session.user.lastName ?? session.user.name.split(' ').slice(1).join(' '),
    email: session.user.email,
  }
  const [personalSaved, setPersonalSaved] = useState(initialPersonal)
  const [personal, setPersonal] = useState(initialPersonal)
  const [savingPersonal, setSavingPersonal] = useState(false)
  const [businessSaved, setBusinessSaved] = useState(BUSINESS)
  const [business, setBusiness] = useState(BUSINESS)
  const [toast, setToast] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const personalDirty = JSON.stringify(personal) !== JSON.stringify(personalSaved)
  const businessDirty = JSON.stringify(business) !== JSON.stringify(businessSaved)
  const country = COUNTRIES.find((item) => item.code === business.country) ?? COUNTRIES[0]
  const patchBusiness = (patch: Partial<typeof BUSINESS>) => setBusiness((current) => ({ ...current, ...patch }))

  return (
    <div className="max-w-[448px]">
      {toast ? <TopToast onClose={() => setToast(null)}>{toast}</TopToast> : null}

      <SectionTitle>Personal profile</SectionTitle>
      <form
        className="mt-4 flex flex-col gap-2"
        onSubmit={async (event) => {
          event.preventDefault()
          const firstName = personal.firstName.trim()
          const lastName = personal.lastName.trim()
          if (!firstName || !lastName) return
          setSavingPersonal(true)
          const { error } = await authClient.updateUser({ name: `${firstName} ${lastName}`, firstName, lastName })
          setSavingPersonal(false)
          if (error) {
            setToast(error.message || 'We couldn’t update your profile')
            return
          }
          setPersonalSaved(personal)
          updateRememberedAccount({ firstName })
          setToast('Your personal profile has been updated')
        }}
      >
        <div className="grid grid-cols-2 gap-[2px]">
          <Input
            aria-label="First name"
            value={personal.firstName}
            onChange={(event) => setPersonal({ ...personal, firstName: event.target.value })}
            className={cn(FIELD, 'rounded-r-[4px]')}
          />
          <Input
            aria-label="Last name"
            value={personal.lastName}
            onChange={(event) => setPersonal({ ...personal, lastName: event.target.value })}
            className={cn(FIELD, 'rounded-l-[4px]')}
          />
        </div>
        <IconInput icon={Mail} type="email" aria-label="Email address" value={personal.email} readOnly />
        <PrimaryButton
          type="submit"
          disabled={!personalDirty || !personal.firstName.trim() || !personal.lastName.trim()}
          loading={savingPersonal}
          className="mt-2"
        >
          Save changes
        </PrimaryButton>
      </form>

      <SettingsDivider />

      <SectionTitle>Business profile</SectionTitle>
      <form
        className="mt-4 flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          setBusinessSaved(business)
          setToast('Your business profile has been updated')
        }}
      >
        {kyb === 'verified' ? (
          <div className="flex h-11 items-center gap-2 rounded-[10px] bg-[#16301f] px-3 text-sm text-[#7d9b86]">
            <CircleCheck className="size-4 fill-[#30c463] text-[#16301f]" />
            KYB verified
          </div>
        ) : (
          <div className="flex h-11 items-center gap-2 rounded-[10px] bg-[#3a3218] px-3 text-sm text-[#a8a08a]">
            <CircleAlert className="size-4 fill-[#f0c14b] text-[#3a3218]" />
            KYB approval in progress
          </div>
        )}
        <Input
          aria-label="Company name"
          value={business.name}
          onChange={(event) => patchBusiness({ name: event.target.value })}
          className={FIELD}
        />
        <div className="flex gap-[2px]">
          <Select
            value={business.country}
            onValueChange={(value) => patchBusiness({ country: String(value) })}
            items={COUNTRIES.map((item) => ({ value: item.code, label: `${item.flag} ${item.code}` }))}
          >
            <SelectTrigger aria-label="Country code" className={cn(SELECT_TRIGGER, 'w-[88px] shrink-0 gap-1 rounded-r-[4px] text-[#9a9a9a]')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={SELECT_CONTENT}>
              {COUNTRIES.map((item) => (
                <SelectItem key={item.code} value={item.code} className={SELECT_ITEM}>
                  {item.flag} {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input aria-label="Country" value={country.name} readOnly className={cn(FIELD, 'flex-1 rounded-l-[4px]')} />
        </div>
        <Input
          aria-label="Registration number"
          value={business.rc}
          onChange={(event) => patchBusiness({ rc: event.target.value })}
          className={FIELD}
        />
        <div className="grid grid-cols-2 gap-[2px]">
          <Select
            value={business.type}
            onValueChange={(value) => patchBusiness({ type: String(value) })}
            items={COMPANY_TYPES.map((item) => ({ value: item, label: item }))}
          >
            <SelectTrigger aria-label="Company type" className={cn(SELECT_TRIGGER, 'rounded-r-[4px]')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={SELECT_CONTENT}>
              {COMPANY_TYPES.map((item) => (
                <SelectItem key={item} value={item} className={SELECT_ITEM}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={business.industry}
            onValueChange={(value) => patchBusiness({ industry: String(value) })}
            items={INDUSTRIES.map((item) => ({ value: item, label: item }))}
          >
            <SelectTrigger aria-label="Industry" className={cn(SELECT_TRIGGER, 'rounded-l-[4px]')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={SELECT_CONTENT}>
              {INDUSTRIES.map((item) => (
                <SelectItem key={item} value={item} className={SELECT_ITEM}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <IconInput
          icon={MapPin}
          aria-label="Street address"
          value={business.address}
          onChange={(event) => patchBusiness({ address: event.target.value })}
        />
        <div className="grid grid-cols-3 gap-[2px]">
          <Input
            aria-label="City"
            value={business.city}
            onChange={(event) => patchBusiness({ city: event.target.value })}
            className={cn(FIELD, 'rounded-r-[4px]')}
          />
          <Input
            aria-label="State"
            value={business.state}
            onChange={(event) => patchBusiness({ state: event.target.value })}
            className={cn(FIELD, 'rounded-[4px]')}
          />
          <Input
            aria-label="Postal code"
            inputMode="numeric"
            value={business.postal}
            onChange={(event) => patchBusiness({ postal: event.target.value.replace(/\D/g, '').slice(0, 6) })}
            className={cn(FIELD, 'rounded-l-[4px]')}
          />
        </div>
        <PrimaryButton type="submit" disabled={!businessDirty} className="mt-2">
          Save changes
        </PrimaryButton>
      </form>

      <SettingsDivider />

      <h2 className="text-[15px] font-medium text-[#f5f5f5]">Danger zone</h2>
      <SettingsRow
        className="mt-3"
        label={
          <>
            <Trash2 className="size-3.5 text-[#e5484d]" />
            Delete account
          </>
        }
        trailing={<ChevronPill />}
        onClick={() => setDeleteOpen(true)}
      />

      <ConfirmDialog
        open={deleteOpen}
        art={<Trash2 className="size-12 fill-[#e5484d] text-[#e5484d]" />}
        title="Delete account?"
        description={
          <>
            Are you sure you want to delete <b>{businessSaved.name}</b>?
          </>
        }
        warning="Deleting your account removes access for every team member, and this can't be reversed."
        confirmLabel="Yes, delete"
        destructive
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false)
          setToast('Your account deletion request has been submitted')
        }}
      />
    </div>
  )
}
