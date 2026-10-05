import { createFileRoute } from '@tanstack/react-router'
import { cn } from 'cn'

import { SectionTitle, SettingsDivider, SettingsRow } from '#/components/settings/settings-ui'
import { useThemePreference } from '#/components/settings/theme'
import type { ThemeChoice } from '#/components/settings/theme'
import { Switch } from '#/components/ui/switch'

export const Route = createFileRoute('/_app/settings/appearance')({
  component: AppearanceSettings,
})

const THEMES: Array<{ value: ThemeChoice; label: string }> = [
  { value: 'dark', label: 'Dark theme' },
  { value: 'light', label: 'Light theme' },
]

function AppearanceSettings() {
  const { theme, followDevice, setTheme, setFollowDevice } = useThemePreference()

  return (
    <div className="max-w-[448px]">
      <SectionTitle>Appearance</SectionTitle>
      <div role="radiogroup" aria-label="Theme" className="mt-4 grid grid-cols-2 gap-2">
        {THEMES.map((item) => {
          const selected = theme === item.value
          return (
            <button
              key={item.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setTheme(item.value)}
              className="group flex flex-col items-center gap-2 outline-none"
            >
              <ThemePreview variant={item.value} selected={selected} />
              <span className={cn('text-xs', selected ? 'text-[#f0f0f0]' : 'text-[#8d8d8d]')}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
      <SettingsDivider />
      <SettingsRow
        label="Use device settings"
        className="h-[52px]"
        trailing={
          <Switch
            checked={followDevice}
            onCheckedChange={setFollowDevice}
            aria-label="Use device settings"
            className="data-checked:bg-[#30c463]"
          />
        }
      />
    </div>
  )
}

function ThemePreview({ variant, selected }: { variant: ThemeChoice; selected: boolean }) {
  const dark = variant === 'dark'
  return (
    <span
      className={cn(
        'relative block h-[100px] w-full overflow-hidden rounded-[12px] border transition-colors',
        dark ? 'bg-[#2a2a2a]' : 'bg-[#f4f4f4]',
        selected ? 'border-[#2fc6b4]' : 'border-transparent group-hover:border-[#3a3a3a]',
      )}
    >
      <span
        className={cn(
          'absolute top-[32px] left-0 h-[68px] w-[86px] rounded-tr-[12px]',
          dark ? 'bg-[#3e3e3e]' : 'bg-[#dedede]',
        )}
      >
        <span className="absolute top-[6px] left-[22px] h-[10px] w-[34px] rounded-full bg-black" />
        <span
          className={cn(
            'absolute top-[34px] left-0 h-[3px] w-[78px] rounded-full',
            dark ? 'bg-[#1f1f1f]' : 'bg-white',
          )}
        />
        <span
          className={cn('absolute top-[46px] left-0 h-[3px] w-[38px] rounded-full', dark ? 'bg-[#1f1f1f]' : 'bg-white')}
        />
        <span
          className={cn('absolute top-[58px] left-0 h-[3px] w-[54px] rounded-full', dark ? 'bg-[#1f1f1f]' : 'bg-white')}
        />
      </span>
    </span>
  )
}
