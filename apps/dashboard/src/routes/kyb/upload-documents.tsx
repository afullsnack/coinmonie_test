import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Check, Plus, RotateCw, Upload, X } from 'lucide-react'
import { cn } from 'cn'

import { FolderIllustration } from '#/components/kyb/illustrations'
import { KybFooter } from '#/components/kyb/kyb-footer'
import { useKyb } from '#/components/kyb/kyb-context'
import type { KybDocument } from '#/components/kyb/kyb-context'

export const Route = createFileRoute('/kyb/upload-documents')({
  component: UploadDocuments,
})

function UploadDocuments() {
  const navigate = useNavigate()
  const { documents, setDocumentStatus } = useKyb()
  const [busyId, setBusyId] = useState<string | null>(null)

  const allUploaded = documents.every((doc) => doc.status === 'uploaded')

  // UI-only wiring: "Upload" shows a brief pending state, then the row flips
  // to uploaded — except the UBO declaration, whose first attempt fails so
  // the design's "Try again" state is reachable.
  const upload = (doc: KybDocument) => {
    if (busyId) return
    setBusyId(doc.id)
    setTimeout(() => {
      setBusyId(null)
      if (doc.id === 'ubo-declaration' && doc.status === 'pending') {
        setDocumentStatus(doc.id, 'failed')
        return
      }
      setDocumentStatus(doc.id, 'uploaded')
    }, 1000)
  }

  return (
    <div>
      <FolderIllustration />
      <h1 className="mt-[24px] text-[22px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
        Upload your documents
      </h1>
      <p className="mt-[10px] text-sm text-[#9a9a9a]">
        Clear photos or PDFs. Files are encrypted and only used for verification
      </p>

      <ul className="mt-[28px] flex flex-col">
        {documents.map((doc) => {
          const uploaded = doc.status === 'uploaded'
          const failed = doc.status === 'failed'
          return (
            <li key={doc.id}>
              {uploaded ? (
                <div className="flex items-center py-[14px]">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#30c463] text-white">
                    <Check className="size-[16px] stroke-3" />
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
                    onClick={() => upload(doc)}
                    className="ml-auto flex items-center gap-[8px] text-sm text-[#f5f5f5] outline-none hover:text-white"
                  >
                    <RotateCw aria-hidden="true" className="size-4" />
                    Replace
                  </button>
                </div>
              ) : failed ? (
                <div className="my-[6px] flex items-center rounded-[16px] border border-dashed border-[#e5484d]/60 bg-[#2a1518] py-[14px] pr-4 pl-[14px]">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e5484d] text-white">
                    <X className="size-[16px] stroke-3" />
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
                    onClick={() => upload(doc)}
                    className="ml-auto flex items-center gap-[8px] text-sm text-[#f5f5f5] outline-none hover:text-white"
                  >
                    <RotateCw
                      aria-hidden="true"
                      className="size-4 text-[#e5484d]"
                    />
                    Try again
                  </button>
                </div>
              ) : (
                <div
                  className={cn(
                    'my-[6px] flex items-center rounded-[16px] bg-[#212121] py-[14px] pr-4 pl-[14px]',
                    busyId === doc.id && 'opacity-70',
                  )}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#2f2f2f] text-[#e6e6e6]">
                    <Upload className="size-4" />
                  </span>
                  <div className="ml-[12px] min-w-0">
                    <p className="truncate text-[15px] font-medium text-[#f5f5f5]">
                      {doc.label}
                    </p>
                    <p className="truncate text-[13px] text-[#9a9a9a]">
                      {doc.hint}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => upload(doc)}
                    className="ml-auto flex items-center gap-[8px] text-sm text-[#f5f5f5] outline-none hover:text-white"
                  >
                    <Plus aria-hidden="true" className="size-4" />
                    Upload
                  </button>
                </div>
              )}
              {uploaded ? (
                <div className="border-b border-dashed border-[#2f2f2f]" />
              ) : null}
            </li>
          )
        })}
      </ul>

      <KybFooter
        leftLabel="Back"
        onLeft={() => navigate({ to: '/kyb/directors-and-ubos' })}
        rightLabel="Continue"
        rightEnabled={allUploaded}
        onRight={() => navigate({ to: '/kyb/review-and-submit' })}
      />
    </div>
  )
}
