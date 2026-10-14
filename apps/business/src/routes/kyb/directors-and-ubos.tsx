import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { CircleCheck, Pencil, Plus, Trash2 } from 'lucide-react'

import { PersonIllustration } from '#/components/kyb/illustrations'
import { KybFooter } from '#/components/kyb/kyb-footer'
import { ownerColor, ownerInitials, useKyb } from '#/components/kyb/kyb-context'
import type { Owner } from '#/components/kyb/kyb-context'
import { OwnerModal } from '#/components/kyb/owner-modal'
import { RemoveOwnerModal } from '#/components/kyb/remove-owner-modal'
import { KybToast, useKybToast } from '#/components/kyb/toast'
import { Separator } from '#/components/ui/separator'

export const Route = createFileRoute('/kyb/directors-and-ubos')({
  component: DirectorsAndUbos,
})

function DirectorsAndUbos() {
  const navigate = useNavigate()
  const { owners, addOwner, removeOwner } = useKyb()
  const { toast, showToast, dismiss } = useKybToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [removing, setRemoving] = useState<Owner | null>(null)

  const confirmRemove = () => {
    if (!removing) return
    removeOwner(removing.id)
    setRemoving(null)
    showToast('Owner removed')
  }

  return (
    <div>
      <PersonIllustration />
      <h1 className="mt-[24px] text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
        Directors and beneficial owners
      </h1>
      <p className="mt-[10px] text-sm text-[#9a9a9a]">
        Add every director, and anyone who owns 25% or more of the business.
        Each person will be verified individually.
      </p>

      {owners.length > 0 ? (
        <ul className="mt-[28px] flex flex-col gap-[14px]">
          {owners.map((owner) => (
            <li
              key={owner.id}
              className="flex h-[66px] items-center rounded-[16px] border border-[#2f2f2f] bg-[#1f1f1f] px-4"
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white"
                style={{ backgroundColor: ownerColor(owner) }}
              >
                {ownerInitials(owner)}
              </span>
              <div className="ml-[12px] min-w-0">
                <p className="flex items-center gap-[6px] text-[15px] font-medium text-[#f5f5f5]">
                  <span className="truncate">
                    {owner.firstName} {owner.lastName}
                  </span>
                  <CircleCheck
                    className="size-[14px] shrink-0 text-[#30c463]"
                    fill="currentColor"
                    stroke="#1a1a1a"
                    strokeWidth={2.5}
                  />
                </p>
                <p className="truncate text-[13px] text-[#9a9a9a]">
                  {owner.email}
                </p>
              </div>
              <div className="ml-auto flex items-center">
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-[8px] text-sm text-[#f5f5f5] outline-none hover:text-white"
                >
                  <Pencil aria-hidden="true" className="size-4" />
                  Edit
                </button>
                <Separator
                  orientation="vertical"
                  className="mx-[18px] h-5 w-px bg-[#2f2f2f]"
                />
                <button
                  type="button"
                  onClick={() => setRemoving(owner)}
                  className="flex items-center gap-[8px] text-sm text-[#f5f5f5] outline-none hover:text-white"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="mt-[14px] flex h-[44px] w-full items-center justify-center gap-[10px] rounded-[12px] bg-[#2b2b2b] text-sm text-[#f5f5f5] transition-colors outline-none hover:bg-[#333333]"
      >
        <Plus aria-hidden="true" className="size-4" />
        Add director or beneficial owner
      </button>

      <KybFooter
        leftLabel="Back"
        onLeft={() => navigate({ to: '/kyb/business-details' })}
        rightLabel="Continue"
        rightEnabled={owners.length > 0}
        onRight={() => navigate({ to: '/kyb/upload-documents' })}
      />

      <OwnerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(owner) => {
          addOwner(owner)
          setModalOpen(false)
        }}
      />
      {removing ? (
        <RemoveOwnerModal
          ownerName={`${removing.firstName} ${removing.lastName}`}
          onConfirm={confirmRemove}
          onClose={() => setRemoving(null)}
        />
      ) : null}
      {toast ? <KybToast message={toast} onDismiss={dismiss} /> : null}
    </div>
  )
}
