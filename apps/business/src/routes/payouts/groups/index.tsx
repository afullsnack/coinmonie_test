import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { X } from 'lucide-react'

import { RedPeopleIllustration } from '#/components/dashboard/illustrations'
import { MemberTable } from '#/components/payouts/member-table'
import { SAVED_GROUP_MEMBERS } from '#/components/payouts/payout-context'
import type { GroupMember } from '#/components/payouts/payout-context'

export const Route = createFileRoute('/payouts/groups/')({
  head: () => ({ meta: [{ title: 'Payout group · CoinMonie' }] }),
  component: ManageGroup,
})

const GROUP_NAME = 'NASAI Staff'

function ManageGroup() {
  const [members, setMembers] = useState<GroupMember[]>(SAVED_GROUP_MEMBERS)
  const [dissolveOpen, setDissolveOpen] = useState(false)

  return (
    <main className="mx-auto w-[1000px] max-w-[calc(100%-48px)] pt-[58px] pb-16">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
          Payout group
        </h1>
        <button
          type="button"
          onClick={() => setDissolveOpen(true)}
          className="flex h-10 items-center rounded-full bg-[#2b2b2b] px-5 text-sm font-medium text-[#e5484d] transition-colors outline-none hover:bg-[#333333]"
        >
          Dissolve payout group
        </button>
      </div>
      <div className="mt-[16px] h-px bg-[#2b2b2b]" />

      <MemberTable
        className="mt-[20px]"
        members={members}
        onEdit={() => {}}
        onRemove={(member) => setMembers((prev) => prev.filter((m) => m.id !== member.id))}
        empty={
          <div className="px-4 py-12 text-center text-sm text-[#9a9a9a]">
            This payout group has no members
          </div>
        }
      />

      {dissolveOpen ? (
        <DissolveModal
          groupName={GROUP_NAME}
          onCancel={() => setDissolveOpen(false)}
          onConfirm={() => {
            setDissolveOpen(false)
            setMembers([])
          }}
        />
      ) : null}
    </main>
  )
}

/** The "Dissolve payout group?" confirmation dialog. */
function DissolveModal({
  groupName,
  onCancel,
  onConfirm,
}: {
  groupName: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div
        role="dialog"
        aria-label="Dissolve payout group"
        className="w-[600px] max-w-[calc(100%-48px)] rounded-[24px] bg-[#262626] p-[28px] text-center"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onCancel}
          className="absolute top-[22px] right-[22px] text-[#e6e6e6] outline-none hover:text-white"
        >
          <X className="size-[22px]" />
        </button>
        <RedPeopleIllustration className="mx-auto" />
        <h2 className="mt-[16px] text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
          Dissolve payout group?
        </h2>
        <p className="mt-[10px] text-sm text-[#9a9a9a]">
          Are you sure you want to dissolve{' '}
          <strong className="font-semibold text-[#e6e6e6]">
            {groupName} payout group
          </strong>
          ?
        </p>
        <div className="mt-[24px] flex gap-[10px]">
          <button
            type="button"
            onClick={onCancel}
            className="h-[48px] flex-1 rounded-[12px] bg-[#2b2b2b] text-sm font-medium text-[#f5f5f5] transition-colors outline-none hover:bg-[#333333]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-[48px] flex-1 rounded-[12px] bg-[#e5484d] text-sm font-medium text-white transition-colors outline-none hover:bg-[#d63c41]"
          >
            Yes, dissolve group
          </button>
        </div>
      </div>
    </div>
  )
}
