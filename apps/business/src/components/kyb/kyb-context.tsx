import { createContext, useContext, useMemo, useState } from 'react'

export interface BusinessDetails {
  legalName: string
  countryCode: string
  country: string
  registrationNumber: string
  businessType: string
  industry: string
  address: string
  city: string
  state: string
  postalCode: string
}

export interface Owner {
  id: string
  firstName: string
  lastName: string
  email: string
  day: string
  month: string
  year: string
  nationality: string
  address: string
  ownership: string
  role: string
}

export type DocumentStatus = 'pending' | 'uploading' | 'uploaded' | 'failed'

export interface KybDocument {
  id: string
  label: string
  hint: string
  filename: string
  status: DocumentStatus
}

const EMPTY_DETAILS: BusinessDetails = {
  legalName: '',
  countryCode: '',
  country: '',
  registrationNumber: '',
  businessType: '',
  industry: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
}

export const KYB_DOCUMENTS: KybDocument[] = [
  {
    id: 'certificate',
    label: 'Certificate of incorporation',
    hint: 'Drag & drop or browse · PDF, JPG, PNG up to 10MB',
    filename: 'Certification_of_incorporation.pdf',
    status: 'pending',
  },
  {
    id: 'address-proof',
    label: 'Upload proof of business address',
    hint: 'Drag & drop or browse · PDF, JPG, PNG up to 10MB',
    filename: 'Address.pdf',
    status: 'pending',
  },
  {
    id: 'director-id',
    label: 'Director ID (passport or national ID)',
    hint: 'Drag & drop or browse · PDF, JPG, PNG up to 10MB',
    filename: 'Id.png',
    status: 'pending',
  },
  {
    id: 'ubo-declaration',
    label: 'Ownership / UBO declaration',
    hint: 'Drag & drop or browse · PDF up to 10MB',
    filename: 'Documents.png',
    status: 'pending',
  },
]

interface KybState {
  details: BusinessDetails
  setDetails: (patch: Partial<BusinessDetails>) => void
  owners: Owner[]
  addOwner: (owner: Owner) => void
  removeOwner: (id: string) => void
  documents: KybDocument[]
  setDocumentStatus: (id: string, status: DocumentStatus) => void
}

const KybContext = createContext<KybState | null>(null)

export function KybProvider({ children }: { children: React.ReactNode }) {
  const [details, setDetailsState] = useState(EMPTY_DETAILS)
  const [owners, setOwners] = useState<Owner[]>([])
  const [documents, setDocuments] = useState(KYB_DOCUMENTS)

  const value = useMemo<KybState>(
    () => ({
      details,
      setDetails: (patch) => setDetailsState((prev) => ({ ...prev, ...patch })),
      owners,
      addOwner: (owner) => setOwners((prev) => [...prev, owner]),
      removeOwner: (id) => setOwners((prev) => prev.filter((o) => o.id !== id)),
      documents,
      setDocumentStatus: (id, status) =>
        setDocuments((prev) =>
          prev.map((d) => (d.id === id ? { ...d, status } : d)),
        ),
    }),
    [details, owners, documents],
  )

  return <KybContext.Provider value={value}>{children}</KybContext.Provider>
}

export function useKyb() {
  const ctx = useContext(KybContext)
  if (!ctx) throw new Error('useKyb must be used inside the KYB layout route')
  return ctx
}

const AVATAR_COLORS = [
  '#d94fd0',
  '#3b82f6',
  '#f97316',
  '#22a06b',
  '#8b5cf6',
  '#eab308',
]

export function ownerInitials(owner: Pick<Owner, 'firstName' | 'lastName'>) {
  return `${owner.firstName.charAt(0)}${owner.lastName.charAt(0)}`.toUpperCase()
}

export function ownerColor(owner: Owner) {
  return AVATAR_COLORS[
    owner.id.charCodeAt(owner.id.length - 1) % AVATAR_COLORS.length
  ]
}

export function formatDate(day: string, month: string, year: string) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const d = Number(day)
  const m = Number(month)
  if (!d || !m || !year) return ''
  const suffix =
    d % 10 === 1 && d !== 11
      ? 'st'
      : d % 10 === 2 && d !== 12
        ? 'nd'
        : d % 10 === 3 && d !== 13
          ? 'rd'
          : 'th'
  return `${d}${suffix} ${months[m - 1]}, ${year}`
}
