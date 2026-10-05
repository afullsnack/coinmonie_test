import { createContext, useContext, useMemo, useState } from 'react'

export type PayoutType = 'single' | 'bulk'
export type QuickAction = 'auto-convert' | 'hold' | 'split' | null

export interface Wallet {
  id: string
  label: string
  icon: string
  balance: string
}

export interface Beneficiary {
  id: string
  name: string
  bank: string
  account: string
  country: string
  color: string
}

export const WALLETS: Wallet[] = [
  { id: 'usdc', label: 'USDC balance', icon: '$', balance: '42,800.00' },
  { id: 'naira', label: 'Naira', icon: '🇳🇬', balance: '18,450,000' },
  { id: 'cedi', label: 'Cedi', icon: '🇬🇭', balance: '96,200' },
  { id: 'shilling', label: 'Shilling', icon: '🇰🇪', balance: '1,240,000' },
]

export const BENEFICIARIES: Beneficiary[] = [
  {
    id: 'ada',
    name: 'Ada Okafor',
    bank: 'GTBank',
    account: '0123456789',
    country: 'Nigeria',
    color: '#f0742e',
  },
  {
    id: 'kwame',
    name: 'Kwame Boateng',
    bank: 'Ecobank',
    account: '3426182214',
    country: 'Ghana',
    color: '#3b82f6',
  },
  {
    id: 'amina',
    name: 'Amina Said',
    bank: 'Access',
    account: '6722389031',
    country: 'Kenya',
    color: '#8b5cf6',
  },
]

export const USDC_NGN_RATE = 1631

interface PayoutState {
  type: PayoutType | null
  setType: (type: PayoutType) => void
  walletId: string | null
  setWalletId: (id: string) => void
  recipientId: string | null
  setRecipientId: (id: string) => void
  amount: string
  setAmount: (amount: string) => void
  quickAction: QuickAction
  setQuickAction: (action: QuickAction) => void
  reference: string
  setReference: (reference: string) => void
}

const PayoutContext = createContext<PayoutState | null>(null)

export function PayoutProvider({ children }: { children: React.ReactNode }) {
  const [type, setType] = useState<PayoutType | null>(null)
  const [walletId, setWalletId] = useState<string | null>(null)
  const [recipientId, setRecipientId] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [quickAction, setQuickAction] = useState<QuickAction>('auto-convert')
  const [reference, setReference] = useState('')

  const value = useMemo<PayoutState>(
    () => ({
      type,
      setType,
      walletId,
      setWalletId,
      recipientId,
      setRecipientId,
      amount,
      setAmount,
      quickAction,
      setQuickAction,
      reference,
      setReference,
    }),
    [type, walletId, recipientId, amount, quickAction, reference],
  )

  return (
    <PayoutContext.Provider value={value}>{children}</PayoutContext.Provider>
  )
}

export function usePayout() {
  const ctx = useContext(PayoutContext)
  if (!ctx)
    throw new Error('usePayout must be used inside the payouts layout route')
  return ctx
}

/** Shared member list for the payout-group pages. */
export interface GroupMember {
  id: string
  name: string
  note: string
  bank: string
  account: string
  amount: string
  color: string
}

export const SAVED_GROUP_MEMBERS: GroupMember[] = [
  {
    id: 'ada',
    name: 'Ada Okafor',
    note: 'Payroll',
    bank: 'GTBank',
    account: '0123456789',
    amount: '₦850,000',
    color: '#f0742e',
  },
  {
    id: 'kwame',
    name: 'Kwame Boateng',
    note: 'Payroll',
    bank: 'Ecobank',
    account: '3426182214',
    amount: 'GHS 12,400',
    color: '#3b82f6',
  },
  {
    id: 'amina',
    name: 'Amina Said',
    note: 'Payroll',
    bank: 'Access',
    account: '6722389031',
    amount: 'KES 180,000',
    color: '#8b5cf6',
  },
]
