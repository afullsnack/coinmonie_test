import { useMemo, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Pencil, Plus, UserRound, X } from 'lucide-react'

import { PrimaryButton } from '#/components/auth/primary-button'
import { Initials, StatusBadge, TopToast } from '#/components/money/chrome'
import { DataTable, createDataColumns } from '#/components/money/data-table'
import { useStepUp } from '#/components/auth/step-up'
import { ConfirmDialog } from '#/components/settings/dialogs'
import { SectionTitle } from '#/components/settings/settings-ui'
import { Separator } from '#/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Sheet, SheetContent, SheetTitle } from '#/components/ui/sheet'
import { authClient, authErrorMessage } from '#/lib/auth-client'

export const Route = createFileRoute('/_app/settings/team')({
  component: TeamSettings,
})

type Role = 'owner' | 'admin' | 'member'

const ROLE_LABEL: Record<Role, string> = { owner: 'Owner', admin: 'Admin', member: 'Member' }
const EDITABLE_ROLES: Role[] = ['owner', 'admin']
const AVATAR_COLORS = ['#d946ef', '#3b82f6', '#f0742e', '#30c463', '#eab308', '#14b8a6']

type Member = {
  id: string
  name: string
  initials: string
  color: string
  email: string
  role: Role
  joined: string
  isYou: boolean
}

function colorFor(id: string) {
  let hash = 0
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join('') || '?'
  )
}

function formatJoined(date: Date | string) {
  const value = new Date(date)
  const day = value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const time = value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${day} ${time}`
}

const col = createDataColumns<Member>()

function TeamSettings() {
  const navigate = useNavigate()
  const stepUp = useStepUp()
  const { data: session } = authClient.useSession()
  const organization = authClient.useActiveOrganization()
  const [editing, setEditing] = useState<Member | null>(null)
  const [removing, setRemoving] = useState<Member | null>(null)
  const [toast, setToast] = useState<{ tone?: 'info'; text: React.ReactNode } | null>(null)

  const members = useMemo<Member[]>(
    () =>
      (organization.data?.members ?? []).map((member) => ({
        id: member.id,
        name: member.user.name,
        initials: initialsOf(member.user.name),
        color: colorFor(member.userId),
        email: member.user.email,
        role: (member.role.split(',')[0] as Role) ?? 'member',
        joined: formatJoined(member.createdAt),
        isYou: member.userId === session?.user.id,
      })),
    [organization.data?.members, session?.user.id],
  )
  const myRole = members.find((member) => member.isYou)?.role
  const canManage = myRole === 'owner' || myRole === 'admin'

  const fail = (error: { message?: string; code?: string }) =>
    setToast({ tone: 'info', text: authErrorMessage(error) })

  const saveRole = async (member: Member, role: Role) => {
    const { error } = await authClient.organization.updateMemberRole({ memberId: member.id, role })
    if (error) return fail(error)
    organization.refetch()
    setEditing(null)
    setToast({
      text: (
        <>
          <b>{member.name}</b> has been updated
        </>
      ),
    })
  }

  const removeMember = async (member: Member) => {
    setRemoving(null)
    if (!(await stepUp.requirePin())) return
    const { error } = await authClient.organization.removeMember({ memberIdOrEmail: member.id })
    if (error) return fail(error)
    organization.refetch()
    setToast({
      text: (
        <>
          <b>{member.name}</b> has been removed successfully
        </>
      ),
    })
  }

  const columns = useMemo(
    () =>
      col.columns([
        col.accessor('name', {
          header: 'Name',
          meta: { width: '28%' },
          cell: ({ row }) => (
            <div className="flex items-center gap-2.5">
              <Initials color={row.original.color} className="size-7 text-[10px]">
                {row.original.initials}
              </Initials>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[13px] font-medium text-[#f5f5f5]">
                  {row.original.name}
                  {row.original.isYou ? <span className="font-normal text-[#9a9a9a]"> (you)</span> : null}
                </p>
                <p className="truncate text-xs text-[#9a9a9a]">{row.original.email}</p>
              </div>
            </div>
          ),
        }),
        col.accessor('role', {
          header: 'Role',
          meta: { width: '14%' },
          cell: ({ getValue }) => (
            <span className="rounded-full bg-[#2e2e2e] px-2 py-1 text-xs text-[#e8e8e8]">{ROLE_LABEL[getValue()]}</span>
          ),
        }),
        col.display({
          id: 'status',
          header: 'Status',
          meta: { width: '14%' },
          cell: () => <StatusBadge tone="successful">Active</StatusBadge>,
        }),
        col.accessor('joined', { header: 'Date joined', meta: { width: '23%' } }),
        col.display({
          id: 'actions',
          header: 'Actions',
          cell: ({ row }) =>
            canManage ? (
              <div className="flex items-center gap-5 text-[#e8e8e8]">
                <button
                  type="button"
                  onClick={() => setEditing(row.original)}
                  className="flex items-center gap-1 outline-none hover:text-white"
                >
                  <Pencil className="size-3.5" />
                  Edit
                </button>
                {row.original.isYou ? null : (
                  <button
                    type="button"
                    onClick={() => setRemoving(row.original)}
                    className="flex items-center gap-1 outline-none hover:text-white"
                  >
                    <UserRound className="size-3.5" />
                    Remove
                  </button>
                )}
              </div>
            ) : null,
        }),
      ]),
    [canManage],
  )

  return (
    <div className="max-w-[820px]">
      {toast ? (
        <TopToast tone={toast.tone} onClose={() => setToast(null)}>
          {toast.text}
        </TopToast>
      ) : null}
      <SectionTitle
        action={
          <button
            type="button"
            onClick={() => navigate({ to: '/kyb/directors-and-ubos' })}
            className="flex h-11 shrink-0 items-center gap-2 rounded-[14px] bg-[#262626] px-5 text-[15px] whitespace-nowrap text-[#f0f0f0] outline-none hover:bg-[#2e2e2e]"
          >
            <Plus className="size-4" />
            Add director or beneficial owner
          </button>
        }
      >
        Team
      </SectionTitle>

      <DataTable
        tone="raised"
        className="mt-3"
        minWidth={680}
        columns={columns}
        data={members}
        getRowId={(member) => member.id}
        rowClassName="[&>td]:h-[56px]"
        footer={
          organization.isPending ? (
            <p className="py-8 text-center text-sm text-[#8d8d8d]">Loading team…</p>
          ) : members.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#8d8d8d]">No team members yet</p>
          ) : null
        }
      />

      <EditMemberSheet
        key={editing?.id}
        member={editing}
        onClose={() => setEditing(null)}
        onSave={async (role) => {
          if (editing) await saveRole(editing, role)
        }}
      />

      <ConfirmDialog
        open={removing !== null}
        art={<RemoveMemberArt />}
        title="Remove team member"
        description={
          <>
            Are you sure you want to remove <b>{removing?.name}</b> team member?
          </>
        }
        warning="They will immediately lose access to this business dashboard"
        confirmLabel="Yes, remove"
        destructive
        onCancel={() => setRemoving(null)}
        onConfirm={() => removing && void removeMember(removing)}
      />
    </div>
  )
}

function EditMemberSheet({
  member,
  onClose,
  onSave,
}: {
  member: Member | null
  onClose: () => void
  onSave: (role: Role) => Promise<void> | void
}) {
  const [role, setRole] = useState<Role>(member?.role ?? 'admin')
  const [saving, setSaving] = useState(false)
  const roles = member && !EDITABLE_ROLES.includes(member.role) ? [member.role, ...EDITABLE_ROLES] : EDITABLE_ROLES

  return (
    <Sheet open={member !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        showCloseButton={false}
        overlayClassName="bg-black/40"
        className="gap-0 rounded-bl-[20px] border-0 bg-[#1c1c1c] p-4 text-[#f0f0f0] data-[side=right]:bottom-auto data-[side=right]:h-auto data-[side=right]:w-[400px] data-[side=right]:sm:max-w-[400px]"
      >
        <div className="flex items-center justify-between">
          <SheetTitle className="text-[15px] font-semibold text-white">Edit team member</SheetTitle>
          <button type="button" aria-label="Close" onClick={onClose} className="text-white outline-none">
            <X className="size-5" />
          </button>
        </div>
        <Separator className="my-4 bg-[#2a2a2a]" />
        {member ? (
          <>
            <div className="flex items-center gap-3">
              <Initials color={member.color} className="size-10 text-sm">
                {member.initials}
              </Initials>
              <div>
                <p className="text-[15px] font-semibold text-white">{member.name}</p>
                <StatusBadge tone="successful">Active</StatusBadge>
              </div>
            </div>
            <Separator className="my-4 bg-[#2a2a2a]" />
            <div className="flex justify-between text-xs">
              <div>
                <p className="text-[#8d8d8d]">Team member ID</p>
                <p className="mt-1 text-[13px] text-[#f0f0f0]">TM-{member.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-[#8d8d8d]">Date joined</p>
                <p className="mt-1 text-[13px] text-[#f0f0f0]">{member.joined}</p>
              </div>
            </div>
            <Separator className="my-4 bg-[#2a2a2a]" />
            <p className="mb-2 text-xs text-[#8d8d8d]">Role</p>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as Role)}
              items={roles.map((item) => ({ value: item, label: ROLE_LABEL[item] }))}
            >
              <SelectTrigger className="h-11 w-full justify-between rounded-[12px] border-0 bg-[#2a2a2a] px-3 text-sm text-[#f0f0f0] hover:bg-[#2a2a2a] focus-visible:ring-0 dark:bg-[#2a2a2a] dark:hover:bg-[#2a2a2a]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-[12px] border border-[#2f2f2f] bg-[#232323] p-1 text-[#e6e6e6] ring-0">
                {roles.map((item) => (
                  <SelectItem
                    key={item}
                    value={item}
                    className="rounded-[10px] px-2.5 py-2 text-sm data-highlighted:bg-[#333]"
                  >
                    {ROLE_LABEL[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Separator className="my-4 bg-[#2a2a2a]" />
            <PrimaryButton
              type="button"
              loading={saving}
              disabled={role === member.role}
              onClick={async () => {
                setSaving(true)
                await onSave(role)
                setSaving(false)
              }}
            >
              Save changes
            </PrimaryButton>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function RemoveMemberArt() {
  return (
    <svg viewBox="0 0 48 40" className="h-10 w-12" aria-hidden="true">
      <circle cx="20" cy="10" r="8" fill="#e5484d" />
      <path d="M4 36c0-9 7-14 16-14s16 5 16 14z" fill="#e5484d" />
      <rect x="34" y="11" width="10" height="3" rx="1.5" fill="#e5484d" />
    </svg>
  )
}
