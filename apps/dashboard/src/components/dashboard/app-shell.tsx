import { useState } from 'react'
import { Link, Outlet, useNavigate, useRouter, useRouterState } from '@tanstack/react-router'
import {
  ArrowUpRight,
  Bell,
  ChevronDown,
  ChevronRight,
  Code,
  FileText,
  Home,
  LayoutGrid,
  LifeBuoy,
  Lock,
  LogOut,
  Moon,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { cn } from 'cn'

import {
  BellIllustration,
  Wordmark,
} from '#/components/dashboard/illustrations'
import { useThemePreference } from '#/components/settings/theme'
import { Popover, PopoverContent, PopoverTrigger } from '#/components/ui/popover'
import { Switch } from '#/components/ui/switch'
import { authClient } from '#/lib/auth-client'
import type { AppSession } from '#/lib/session'

const NAV = [
  { label: 'Dashboard', icon: Home, to: '/dashboard' },
  { label: 'Balances', icon: LayoutGrid, to: '/balances' },
  { label: 'Collections', icon: Wallet, to: '/collections' },
  { label: 'Beneficiaries', icon: Users, to: '/beneficiaries' },
  { label: 'Transactions', icon: Lock, to: '/transactions' },
]

const GETTING_STARTED = [
  { label: 'Complete KYB', icon: FileText, to: '/kyb/business-details' },
  { label: 'Setup 2FA', icon: ShieldCheck, to: '/settings/security' },
  { label: 'Make payout', icon: ArrowUpRight, to: '/payouts/new' },
]

const BREADCRUMBS = [
  ['/balances', 'Balances'],
  ['/collections', 'Collections'],
  ['/beneficiaries', 'Beneficiaries'],
  ['/transactions', 'Transactions'],
  ['/payouts', 'Payouts'],
  ['/settings', 'Settings'],
] as const

const PRIMARY = 'text-[#9a9a9a] hover:text-white transition-colors'
const ITEM =
  'flex h-11 w-full items-center gap-3 rounded-[10px] px-4 text-[15px] outline-none transition-colors'

function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?'
  )
}

export function AppShell({ session }: { session: AppSession }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const breadcrumb =
    BREADCRUMBS.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? 'Dashboard'
  const navigate = useNavigate()
  const router = useRouter()
  const [gettingStartedOpen, setGettingStartedOpen] = useState(true)
  const { theme, setTheme } = useThemePreference()
  const live = authClient.useSession().data
  const user = live?.user ?? session.user
  const { data: organization } = authClient.useActiveOrganization()

  const logout = async () => {
    await authClient.signOut()
    await router.invalidate()
    navigate({ to: '/signin' })
  }

  return (
    <div className="flex min-h-dvh bg-[#161616] font-sans text-[#e6e6e6] antialiased">
      <aside className="fixed inset-y-0 left-0 flex w-[258px] flex-col border-r border-[#232323] bg-[#0e0e0e] px-4 py-5">
        <div className="px-2 pb-5">
          <Wordmark />
        </div>
        <div className="h-px bg-[#232323]" />

        <nav className="mt-4 flex flex-col gap-1">
          {NAV.map((item) => (
            <NavItem
              key={item.label}
              {...item}
              active={item.to ? pathname === item.to || pathname.startsWith(`${item.to}/`) : false}
            />
          ))}
        </nav>

        <div className="my-4 h-px bg-[#232323]" />

        <nav className="flex flex-col gap-1">
          <button type="button" className={cn(ITEM, 'justify-start', PRIMARY)}>
            <Code className="size-[18px]" />
            Developers
          </button>
          <NavItem
            label="Settings"
            icon={Settings}
            to="/settings"
            active={pathname === '/settings' || pathname.startsWith('/settings/')}
          />
        </nav>

        <div className="mt-4 rounded-[12px] border border-[#262626] bg-[#141414] p-3">
          <button
            type="button"
            onClick={() => setGettingStartedOpen((v) => !v)}
            className="flex w-full items-center justify-between px-1 py-1 outline-none"
          >
            <span className="text-[15px] font-semibold text-[#f5f5f5]">
              Getting started
            </span>
            <span className="flex size-7 items-center justify-center rounded-full bg-[#262626] text-[#c9c9c9]">
              {gettingStartedOpen ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </span>
          </button>
          {gettingStartedOpen ? (
            <div className="mt-3 flex flex-col gap-2">
              {GETTING_STARTED.filter((task) => !(task.to === '/settings/security' && user.twoFactorEnabled)).map((task) => (
                <button
                  key={task.label}
                  type="button"
                  onClick={() => task.to && navigate({ to: task.to })}
                  className="flex h-11 items-center gap-3 rounded-[10px] border border-[#2a2a2a] bg-[#191919] px-3 text-sm text-[#e6e6e6] outline-none transition-colors hover:border-[#3a3a3a]"
                >
                  <task.icon
                    aria-hidden="true"
                    className="size-4 text-[#c9c9c9]"
                  />
                  <span className="flex-1 text-left">{task.label}</span>
                  <ChevronRight
                    aria-hidden="true"
                    className="size-4 text-[#8a8a8a]"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between px-2 py-3">
            <span className="flex items-center gap-2 text-sm text-[#e6e6e6]">
              <Moon aria-hidden="true" className="size-4" />
              Dark mode
            </span>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              aria-label="Toggle dark mode"
              className="data-checked:bg-[#30c463]"
            />
          </div>
          <div className="h-px bg-[#232323]" />
          <AccountMenu
            user={user}
            organization={organization?.name ?? 'Your business'}
            onLogout={logout}
          />
        </div>
      </aside>

      <div className="ml-[258px] flex min-h-dvh min-w-0 flex-1 flex-col">
        <header className="flex h-[70px] items-center justify-between border-b border-[#232323] px-6">
          <span className="text-[15px] text-[#9a9a9a]">{breadcrumb}</span>
          <div className="flex items-center gap-2">
            <NotificationsButton />
            <button
              type="button"
              aria-label="Help"
              className={cn(
                'flex size-9 items-center justify-center rounded-full transition-colors hover:bg-[#242424]',
                PRIMARY,
              )}
            >
              <LifeBuoy className="size-[18px]" />
            </button>
            <div className="ml-1 flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f0742e] text-[13px] font-semibold text-white">
                {initialsOf(user.name)}
              </span>
              <div className="min-w-0 leading-tight">
                <p className="max-w-[150px] truncate text-sm font-medium text-[#f5f5f5]">{user.name}</p>
                <p className="max-w-[150px] truncate text-[13px] text-[#9a9a9a]">{user.email}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="min-w-0 flex-1 px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function NavItem({
  label,
  icon: Icon,
  to,
  active,
}: {
  label: string
  icon: React.ComponentType<{ className?: string }>
  to?: string
  active?: boolean
}) {
  const className = cn(ITEM, active ? 'bg-[#1f1f1f] text-[#f5f5f5]' : PRIMARY)
  if (to) {
    return (
      <Link to={to} className={className}>
        <Icon className="size-[18px]" />
        {label}
      </Link>
    )
  }
  return (
    <button type="button" className={className}>
      <Icon className="size-[18px]" />
      {label}
    </button>
  )
}

function AccountMenu({
  user,
  organization,
  onLogout,
}: {
  user: { name: string; email: string }
  organization: string
  onLogout: () => Promise<void>
}) {
  const [leaving, setLeaving] = useState(false)
  return (
    <Popover>
      <PopoverTrigger className="flex w-full items-center gap-3 rounded-[10px] px-2 py-4 text-left outline-none hover:bg-[#151515]">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#2eb0a0] text-[13px] font-semibold text-white">
          {initialsOf(organization)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-[#f5f5f5]">{organization}</span>
          <span className="block text-[13px] text-[#9a9a9a]">Standard</span>
        </span>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={6}
        className="w-[226px] gap-0 rounded-[14px] border border-[#262626] bg-[#151515] p-2 text-[#f0f0f0] ring-0"
      >
        <button
          type="button"
          disabled={leaving}
          onClick={async () => {
            setLeaving(true)
            try {
              await onLogout()
            } finally {
              setLeaving(false)
            }
          }}
          className="flex h-10 w-full items-center gap-2 rounded-[10px] px-2 text-sm text-[#ff4d4f] outline-none hover:bg-[#1f1f1f] disabled:opacity-60"
        >
          <LogOut className="size-4" />
          {leaving ? 'Logging out…' : 'Logout'}
        </button>
        <div className="my-1 h-px bg-[#262626]" />
        <div className="flex items-center gap-2 px-2 py-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#f0742e] text-[11px] font-semibold text-white">
            {initialsOf(user.name)}
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[13px] font-medium text-[#f5f5f5]">{user.name}</p>
            <p className="truncate text-xs text-[#9a9a9a]">{user.email}</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function NotificationsButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen(true)}
        className={cn(
          'flex size-9 items-center justify-center rounded-full transition-colors hover:bg-[#242424]',
          PRIMARY,
        )}
      >
        <Bell className="size-[18px]" />
      </button>
      {open ? <NotificationsPanel onClose={() => setOpen(false)} /> : null}
    </>
  )
}

function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'all' | 'unread' | 'read'>('all')
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        role="dialog"
        aria-label="Notifications"
        className="fixed top-[78px] right-3 z-50 flex max-h-[calc(100dvh-100px)] w-[550px] flex-col rounded-[16px] border border-[#2a2a2a] bg-[#1c1c1c] p-5 shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#fafafa]">
            Notifications
          </h2>
          <button
            type="button"
            aria-label="Close notifications"
            onClick={onClose}
            className="text-[#e6e6e6] outline-none hover:text-white"
          >
            <X className="size-[22px]" />
          </button>
        </div>
        <div className="mt-4 flex rounded-full bg-[#262626] p-1">
          {(['all', 'unread', 'read'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'h-9 flex-1 rounded-full text-sm font-medium capitalize outline-none transition-colors',
                tab === t
                  ? 'bg-[#3a3a3a] text-[#f5f5f5]'
                  : 'text-[#9a9a9a] hover:text-[#e6e6e6]',
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <BellIllustration />
          <p className="mt-[16px] text-xl font-semibold text-[#fafafa]">
            No notifications yet
          </p>
          <p className="mt-[6px] text-sm text-[#9a9a9a]">
            All your notifications will show here
          </p>
        </div>
      </div>
    </>
  )
}
