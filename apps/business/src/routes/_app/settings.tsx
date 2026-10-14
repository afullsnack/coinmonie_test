import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/settings')({
  head: () => ({ meta: [{ title: 'Settings · CoinMonie' }] }),
  component: SettingsLayout,
})

const TABS = [
  { label: 'Profile', to: '/settings/profile' },
  { label: 'Team', to: '/settings/team' },
  { label: 'Security', to: '/settings/security' },
  { label: 'Appearance', to: '/settings/appearance' },
  { label: 'Company', to: '/settings/company' },
] as const

function SettingsLayout() {
  return (
    <div className="pt-4">
      <h1 className="text-[26px] font-semibold tracking-[-0.01em] text-[#f5f5f5]">Settings</h1>
      <p className="mt-0.5 text-sm text-[#9a9a9a]">Manage your account preferences and settings</p>
      <div className="mt-8 flex gap-16">
        <nav aria-label="Settings" className="flex h-fit w-[170px] shrink-0 flex-col gap-3 border-r border-[#262626] pr-16">
          {TABS.map((tab) => (
            <Link
              key={tab.to}
              to={tab.to}
              className="flex h-9 w-[104px] items-center rounded-[10px] px-3 text-sm text-[#9a9a9a] outline-none transition-colors hover:text-[#f0f0f0]"
              activeProps={{ className: 'bg-[#262626] text-[#f5f5f5]' }}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
