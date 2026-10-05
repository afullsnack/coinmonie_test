import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { CircleQuestionMark, Copy, Instagram, Linkedin, Mail, Phone, Twitter } from 'lucide-react'

import { TopToast } from '#/components/money/chrome'
import { ChevronPill, SectionTitle, SettingsDivider, SettingsRow } from '#/components/settings/settings-ui'

export const Route = createFileRoute('/_app/settings/company')({
  component: CompanySettings,
})

const CONTACTS = [
  { icon: Phone, label: '+234 81737484021', value: '+23481737484021' },
  { icon: Mail, label: 'contact@coinmonie.com', value: 'contact@coinmonie.com' },
]

const SOCIALS = [
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com/coinmonie' },
  { icon: Twitter, label: 'Twitter', href: 'https://x.com/coinmonie' },
  { icon: Linkedin, label: 'Linkedin', href: 'https://linkedin.com/company/coinmonie' },
]

function CompanySettings() {
  const [toast, setToast] = useState<string | null>(null)

  return (
    <div className="max-w-[448px]">
      {toast ? <TopToast onClose={() => setToast(null)}>{toast}</TopToast> : null}
      <SectionTitle description="Got questions or enquiries? Reach out to us!">Company</SectionTitle>

      <div className="mt-4 flex flex-col gap-1">
        {CONTACTS.map((item) => (
          <SettingsRow
            key={item.value}
            icon={item.icon}
            label={item.label}
            trailing={
              <button
                type="button"
                aria-label={`Copy ${item.label}`}
                onClick={async () => {
                  await navigator.clipboard?.writeText(item.value)
                  setToast(`${item.label} copied`)
                }}
                className="flex size-6 items-center justify-center rounded-full bg-[#3a3a3a] text-[#d0d0d0] outline-none hover:text-white"
              >
                <Copy className="size-3" />
              </button>
            }
          />
        ))}
      </div>

      <SettingsDivider />
      <a href="https://coinmonie.com/faqs" target="_blank" rel="noreferrer" className="block outline-none">
        <SettingsRow icon={CircleQuestionMark} label="FAQs" trailing={<ChevronPill />} className="hover:bg-[#2c2c2c]" />
      </a>

      <SettingsDivider />
      <div className="flex flex-col gap-1">
        {SOCIALS.map((item) => (
          <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="block outline-none">
            <SettingsRow icon={item.icon} label={item.label} trailing={<ChevronPill />} className="hover:bg-[#2c2c2c]" />
          </a>
        ))}
      </div>
    </div>
  )
}
