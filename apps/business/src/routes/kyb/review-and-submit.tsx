import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Check, Pencil, RotateCw } from 'lucide-react'

import { MagnifierIllustration } from '#/components/kyb/illustrations'
import { KybFooter } from '#/components/kyb/kyb-footer'
import { useKyb } from '#/components/kyb/kyb-context'
import { Checkbox } from '#/components/ui/checkbox'

export const Route = createFileRoute('/kyb/review-and-submit')({
  component: ReviewAndSubmit,
})

const ROW = 'flex items-center justify-between text-sm'

function ReviewAndSubmit() {
  const navigate = useNavigate()
  const { details, owners, documents } = useKyb()
  const [confirmed, setConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submit = () => {
    if (!confirmed) return
    setSubmitting(true)
    // UI-only wiring: brief pending state, then the under-review screen.
    setTimeout(() => navigate({ to: '/kyb/under-review' }), 1200)
  }

  const uploaded = documents.filter((doc) => doc.status === 'uploaded')

  return (
    <div>
      <MagnifierIllustration />
      <h1 className="mt-[24px] text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
        Review and submit
      </h1>
      <p className="mt-[10px] text-sm text-[#9a9a9a]">
        Check everything is correct. You can still edit before submitting.
      </p>

      <div className="mt-[28px] flex flex-col gap-[24px]">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-medium text-[#f5f5f5]">
              Business details
            </h2>
            <button
              type="button"
              onClick={() => navigate({ to: '/kyb/business-details' })}
              className="flex items-center gap-[8px] text-sm text-[#f5f5f5] outline-none hover:text-white"
            >
              <Pencil aria-hidden="true" className="size-4" />
              Edit
            </button>
          </div>
          <div className="mt-[12px] flex flex-col gap-[12px] rounded-[16px] border border-[#2f2f2f] px-4 py-4">
            <div className={ROW}>
              <span className="text-[#9a9a9a]">Legal name</span>
              <span className="text-[#e6e6e6]">{details.legalName || '—'}</span>
            </div>
            <div className={ROW}>
              <span className="text-[#9a9a9a]">Country · Reg no.</span>
              <span className="text-[#e6e6e6]">
                {details.country || '—'} · {details.registrationNumber || '—'}
              </span>
            </div>
            <div className={ROW}>
              <span className="text-[#9a9a9a]">Type</span>
              <span className="text-[#e6e6e6]">
                {details.businessType || '—'}
              </span>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-medium text-[#f5f5f5]">
              People ({owners.length})
            </h2>
            <button
              type="button"
              onClick={() => navigate({ to: '/kyb/directors-and-ubos' })}
              className="flex items-center gap-[8px] text-sm text-[#f5f5f5] outline-none hover:text-white"
            >
              <Pencil aria-hidden="true" className="size-4" />
              Edit
            </button>
          </div>
          <div className="mt-[12px] flex flex-col gap-[12px] rounded-[16px] border border-[#2f2f2f] px-4 py-4">
            {owners.length === 0 ? (
              <p className="text-sm text-[#9a9a9a]">No owners added yet</p>
            ) : (
              owners.map((owner) => (
                <div key={owner.id} className={ROW}>
                  <span className="text-[#9a9a9a]">
                    {owner.firstName} {owner.lastName}
                  </span>
                  <span className="text-[#e6e6e6]">{owner.role}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-medium text-[#f5f5f5]">
              Documents ({uploaded.length})
            </h2>
            <button
              type="button"
              onClick={() => navigate({ to: '/kyb/upload-documents' })}
              className="flex items-center gap-[8px] text-sm text-[#f5f5f5] outline-none hover:text-white"
            >
              <Pencil aria-hidden="true" className="size-4" />
              Edit
            </button>
          </div>
          <div className="mt-[12px] flex flex-col gap-[10px]">
            {uploaded.length === 0 ? (
              <div className="rounded-[16px] border border-[#2f2f2f] px-4 py-4 text-sm text-[#9a9a9a]">
                No documents uploaded yet
              </div>
            ) : (
              uploaded.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center rounded-[16px] border border-[#2f2f2f] py-[12px] pr-4 pl-[14px]"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#30c463] text-white">
                    <Check className="size-[14px] stroke-3" />
                  </span>
                  <div className="ml-[12px] min-w-0">
                    <p className="truncate text-[15px] font-medium text-[#f5f5f5]">
                      {doc.label}
                    </p>
                    <p className="truncate text-[13px] text-[#9a9a9a]">
                      {doc.filename}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate({ to: '/kyb/upload-documents' })}
                    className="ml-auto flex items-center gap-[8px] text-sm text-[#f5f5f5] outline-none hover:text-white"
                  >
                    <RotateCw aria-hidden="true" className="size-4" />
                    Replace
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <label className="flex w-fit cursor-pointer items-center gap-[10px] text-sm text-[#9a9a9a]">
          <Checkbox
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(checked === true)}
            className="size-[18px] rounded-[5px] border-[#4a4a4a] bg-transparent data-checked:border-transparent data-checked:bg-[#f5f5f5] data-checked:text-[#1a1a1a] [&_svg]:size-[12px] [&_svg]:stroke-3"
          />
          I confirm the information provided is accurate and complete.
        </label>
      </div>

      <KybFooter
        leftLabel="Back"
        onLeft={() => navigate({ to: '/kyb/upload-documents' })}
        rightLabel="Submit for review"
        rightEnabled={confirmed}
        rightLoading={submitting}
        onRight={submit}
      />
    </div>
  )
}
