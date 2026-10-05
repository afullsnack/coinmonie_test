import type { Tone } from '#/components/money/chrome'

export type TxType = 'Received' | 'Payout' | 'Conversion' | 'Withdrawal'
export type TxCurrency = 'USDC' | 'Naira' | 'Cedi' | 'Shilling'

export type Tx = {
  id: string
  name: string
  initials: string
  color: string
  note: string
  fromFlag: string
  toFlag: string
  amount: string
  fee: string
  tone: Tone
  status: string
  date: string
  type: TxType
  currency: TxCurrency
  detail: TxDetail
}

export type TxDetail = {
  headline: string
  centered?: boolean
  banner?: { tone: 'info' | 'warn' | 'danger'; text: string }
  rows: Array<{ label: string; value: string; copy?: boolean; tone?: Tone }>
  footer:
    | 'close'
    | 'refresh'
    | 'support'
    | 'approve'
    | 'chain'
    | 'receipt'
    | 'bulk-success'
    | 'bulk-processing'
    | 'bulk-failed'
}

const DATE = 'Aug 26, 2025 11:45 AM'
const WHEN = '7 Sep 2026, 12:30 PM'

export const TRANSACTIONS: Tx[] = [
  row({
    id: 'ada-processing',
    name: 'Ada Okafor',
    initials: 'AO',
    color: '#f0742e',
    fromFlag: 'usdc',
    toFlag: '🇳🇬',
    amount: '₦850,000',
    fee: '10 USDC',
    tone: 'processing',
    status: 'Processing',
    type: 'Payout',
    currency: 'Naira',
    detail: fiat('₦250,000', 'processing', 'Your payout is being processed. We’ll update the status when it’s complete.'),
  }),
  row({
    id: 'kwame-ok',
    name: 'Kwame Boateng',
    initials: 'KB',
    color: '#3b82f6',
    fromFlag: 'usdc',
    toFlag: '🇬🇭',
    amount: 'GHS 12,400',
    fee: '1.2 USDC',
    tone: 'successful',
    status: 'Successful',
    type: 'Payout',
    currency: 'Cedi',
    detail: fiat('₦250,000', 'successful'),
  }),
  row({
    id: 'amina-ok',
    name: 'Amina Said',
    initials: 'AS',
    color: '#8b5cf6',
    fromFlag: 'usdc',
    toFlag: '🇰🇪',
    amount: 'KES 180,000',
    fee: '1.4 USDC',
    tone: 'successful',
    status: 'Successful',
    type: 'Payout',
    currency: 'Shilling',
    detail: fiat('₦250,000', 'successful'),
  }),
  row({
    id: 'fiat-failed',
    name: 'John Adebayo',
    initials: 'JA',
    color: '#a855f7',
    fromFlag: 'usdc',
    toFlag: '🇳🇬',
    amount: '₦250,000',
    fee: '₦100',
    tone: 'failed',
    status: 'Failed',
    type: 'Payout',
    currency: 'Naira',
    detail: fiat('₦250,000', 'failed', 'We couldn’t complete this payout.', 'Recipient account could not be credited'),
  }),
  row({
    id: 'fiat-cancelled',
    name: 'John Adebayo',
    initials: 'JA',
    color: '#a855f7',
    fromFlag: 'usdc',
    toFlag: '🇳🇬',
    amount: '₦250,000',
    fee: '₦100',
    tone: 'cancelled',
    status: 'Cancelled',
    type: 'Payout',
    currency: 'Naira',
    detail: fiat('₦250,000', 'cancelled', 'This payout was cancelled before it was completed.', '—'),
  }),
  row({
    id: 'fiat-pending',
    name: 'John Adebayo',
    initials: 'JA',
    color: '#a855f7',
    fromFlag: 'usdc',
    toFlag: '🇳🇬',
    amount: '₦250,000',
    fee: '₦100',
    tone: 'pending',
    status: 'Pending approval',
    type: 'Payout',
    currency: 'Naira',
    detail: {
      headline: '₦250,000',
      banner: { tone: 'info', text: 'This payout needs approval before it can be processed.' },
      rows: [
        person('Recipient', 'John Adebayo', '#a855f7'),
        bank('Bank', 'GTBank'),
        { label: 'Account number', value: '******4821' },
        { label: 'Transaction fee', value: '₦100' },
        { label: 'Total', value: '₦250,100' },
        person('Created by', 'Sarah Okafor', '#3b82f6'),
        { label: 'Date', value: WHEN },
        { label: 'Transaction ID', value: 'TXN-20260907-4KBP2M17', copy: true },
      ],
      footer: 'approve',
    },
  }),
  row({
    id: 'wallet-ok',
    name: 'John A · Contractor',
    initials: 'JA',
    color: '#7c5cff',
    fromFlag: 'usdc',
    toFlag: 'usdc',
    amount: '500 USDC',
    fee: '1 USDC',
    tone: 'successful',
    status: 'Successful',
    type: 'Payout',
    currency: 'USDC',
    detail: wallet('500 USDC', 'successful'),
  }),
  row({
    id: 'wallet-processing',
    name: 'John A · Contractor',
    initials: 'JA',
    color: '#7c5cff',
    fromFlag: 'usdc',
    toFlag: 'usdc',
    amount: '500 USDC',
    fee: '1 USDC',
    tone: 'processing',
    status: 'Processing',
    type: 'Payout',
    currency: 'USDC',
    detail: wallet('500 USDC', 'processing', 'Your payout is being processed. We’ll update the status when it’s complete.'),
  }),
  row({
    id: 'wallet-failed',
    name: 'John A · Contractor',
    initials: 'JA',
    color: '#7c5cff',
    fromFlag: 'usdc',
    toFlag: 'usdc',
    amount: '500 USDC',
    fee: '1 USDC',
    tone: 'failed',
    status: 'Failed',
    type: 'Payout',
    currency: 'USDC',
    detail: wallet('500 USDC', 'failed', 'We couldn’t complete this payout.', 'Wallet address could not be credited'),
  }),
  row({
    id: 'wallet-cancelled',
    name: 'John A · Contractor',
    initials: 'JA',
    color: '#7c5cff',
    fromFlag: 'usdc',
    toFlag: 'usdc',
    amount: '500 USDC',
    fee: '1 USDC',
    tone: 'cancelled',
    status: 'Cancelled',
    type: 'Payout',
    currency: 'USDC',
    detail: wallet('500 USDC', 'cancelled', 'This payout was cancelled before it was completed.', '—'),
  }),
  row({
    id: 'receive-fiat-ok',
    name: 'John Adebayo',
    initials: 'JA',
    color: '#a855f7',
    fromFlag: '🇳🇬',
    toFlag: 'usdc',
    amount: '+₦250,000',
    fee: '₦0',
    tone: 'successful',
    status: 'Successful',
    type: 'Received',
    currency: 'Naira',
    detail: receiveFiat('successful'),
  }),
  row({
    id: 'receive-fiat-processing',
    name: 'John Adebayo',
    initials: 'JA',
    color: '#a855f7',
    fromFlag: '🇳🇬',
    toFlag: 'usdc',
    amount: '+₦250,000',
    fee: '₦0',
    tone: 'processing',
    status: 'Processing',
    type: 'Received',
    currency: 'Naira',
    detail: receiveFiat('processing', 'We’re confirming this payment.'),
  }),
  row({
    id: 'receive-fiat-failed',
    name: 'John Adebayo',
    initials: 'JA',
    color: '#a855f7',
    fromFlag: '🇳🇬',
    toFlag: 'usdc',
    amount: '+₦250,000',
    fee: '₦0',
    tone: 'failed',
    status: 'Failed',
    type: 'Received',
    currency: 'Naira',
    detail: receiveFiat('failed', 'We couldn’t receive this payment.', 'Sender bank rejected the transfer'),
  }),
  row({
    id: 'receive-wallet-ok',
    name: 'USDC deposit',
    initials: '$',
    color: '#2775ca',
    fromFlag: 'usdc',
    toFlag: 'usdc',
    amount: '+150 USDC',
    fee: '0 USDC',
    tone: 'successful',
    status: 'Successful',
    type: 'Received',
    currency: 'USDC',
    detail: receiveWallet('successful'),
  }),
  row({
    id: 'receive-wallet-processing',
    name: 'USDC deposit',
    initials: '$',
    color: '#2775ca',
    fromFlag: 'usdc',
    toFlag: 'usdc',
    amount: '+150 USDC',
    fee: '0 USDC',
    tone: 'processing',
    status: 'Processing',
    type: 'Received',
    currency: 'USDC',
    detail: receiveWallet('processing', 'Waiting for network confirmations.'),
  }),
  row({
    id: 'receive-wallet-failed',
    name: 'USDC deposit',
    initials: '$',
    color: '#2775ca',
    fromFlag: 'usdc',
    toFlag: 'usdc',
    amount: '+150 USDC',
    fee: '0 USDC',
    tone: 'failed',
    status: 'Failed',
    type: 'Received',
    currency: 'USDC',
    detail: receiveWallet('failed', 'We couldn’t receive this deposit.', 'Transaction reverted on chain'),
  }),
  row({
    id: 'convert-ok',
    name: 'USDC → Naira',
    initials: '⇄',
    color: '#3a3a3a',
    fromFlag: 'usdc',
    toFlag: '🇳🇬',
    amount: '₦1,520,000',
    fee: '₦1,520',
    tone: 'successful',
    status: 'Successful',
    type: 'Conversion',
    currency: 'Naira',
    detail: conversion('successful'),
  }),
  row({
    id: 'convert-processing',
    name: 'USDC → Naira',
    initials: '⇄',
    color: '#3a3a3a',
    fromFlag: 'usdc',
    toFlag: '🇳🇬',
    amount: '₦1,520,000',
    fee: '₦1,520',
    tone: 'processing',
    status: 'Processing',
    type: 'Conversion',
    currency: 'Naira',
    detail: conversion('processing', 'Your conversion is being processed.'),
  }),
  row({
    id: 'convert-failed',
    name: 'USDC → Naira',
    initials: '⇄',
    color: '#3a3a3a',
    fromFlag: 'usdc',
    toFlag: '🇳🇬',
    amount: '₦1,520,000',
    fee: '₦1,520',
    tone: 'failed',
    status: 'Failed',
    type: 'Conversion',
    currency: 'Naira',
    detail: conversion('failed', 'We couldn’t complete this conversion.', 'Conversion rate is no longer available'),
  }),
  row({
    id: 'convert-cancelled',
    name: 'USDC → Naira',
    initials: '⇄',
    color: '#3a3a3a',
    fromFlag: 'usdc',
    toFlag: '🇳🇬',
    amount: '₦1,520,000',
    fee: '₦1,520',
    tone: 'cancelled',
    status: 'Cancelled',
    type: 'Conversion',
    currency: 'Naira',
    detail: conversion('cancelled', 'This conversion was cancelled before it was completed.', '—'),
  }),
  row({
    id: 'withdraw-ok',
    name: 'GTBank',
    initials: 'GT',
    color: '#f0742e',
    fromFlag: '🇳🇬',
    toFlag: '🇳🇬',
    amount: '₦500,000',
    fee: '₦100',
    tone: 'successful',
    status: 'Successful',
    type: 'Withdrawal',
    currency: 'Naira',
    detail: withdrawal('successful'),
  }),
  row({
    id: 'withdraw-processing',
    name: 'GTBank',
    initials: 'GT',
    color: '#f0742e',
    fromFlag: '🇳🇬',
    toFlag: '🇳🇬',
    amount: '₦500,000',
    fee: '₦100',
    tone: 'processing',
    status: 'Processing',
    type: 'Withdrawal',
    currency: 'Naira',
    detail: withdrawal('processing', 'Your withdrawal is being processed. We’ll notify you when the money reaches your bank account.'),
  }),
  row({
    id: 'withdraw-failed',
    name: 'GTBank',
    initials: 'GT',
    color: '#f0742e',
    fromFlag: '🇳🇬',
    toFlag: '🇳🇬',
    amount: '₦500,000',
    fee: '₦100',
    tone: 'failed',
    status: 'Failed',
    type: 'Withdrawal',
    currency: 'Naira',
    detail: withdrawal('failed', 'We couldn’t complete this withdrawal.', 'Destination bank declined the transfer'),
  }),
  row({
    id: 'withdraw-cancelled',
    name: 'GTBank',
    initials: 'GT',
    color: '#f0742e',
    fromFlag: '🇳🇬',
    toFlag: '🇳🇬',
    amount: '₦500,000',
    fee: '₦100',
    tone: 'cancelled',
    status: 'Cancelled',
    type: 'Withdrawal',
    currency: 'Naira',
    detail: withdrawal('cancelled', 'This withdrawal was cancelled before it was completed.', '—'),
  }),
  row({
    id: 'bulk-ok',
    name: 'Payroll · 100',
    initials: 'PY',
    color: '#f0742e',
    fromFlag: 'usdc',
    toFlag: '🇳🇬',
    amount: '₦4,250,000',
    fee: '₦0',
    tone: 'successful',
    status: 'Successful',
    type: 'Payout',
    currency: 'Naira',
    detail: bulk('successful'),
  }),
  row({
    id: 'bulk-processing',
    name: 'Payroll · 100',
    initials: 'PY',
    color: '#f0742e',
    fromFlag: 'usdc',
    toFlag: '🇳🇬',
    amount: '₦4,250,000',
    fee: '₦0',
    tone: 'processing',
    status: 'Processing',
    type: 'Payout',
    currency: 'Naira',
    detail: bulk('processing', 'We’re processing your payouts. You can leave this page and check back later.'),
  }),
  row({
    id: 'bulk-failed',
    name: 'Payroll · 100',
    initials: 'PY',
    color: '#f0742e',
    fromFlag: 'usdc',
    toFlag: '🇳🇬',
    amount: '₦4,250,000',
    fee: '₦0',
    tone: 'failed',
    status: 'Failed',
    type: 'Payout',
    currency: 'Naira',
    detail: bulk('failed', 'We couldn’t complete this payout.', 'Payout file could not be processed'),
  }),
]

function row(input: Omit<Tx, 'note' | 'date'> & { note?: string; date?: string }): Tx {
  return { note: 'Payroll', date: DATE, ...input }
}

function person(label: string, value: string, _color: string) {
  return { label, value }
}
function bank(label: string, value: string) {
  return { label, value }
}

function fiat(amount: string, state: 'successful' | 'processing' | 'failed' | 'cancelled', banner?: string, reason?: string): TxDetail {
  return {
    headline: amount,
    banner: banner
      ? { tone: state === 'processing' ? 'warn' : 'danger', text: banner }
      : undefined,
    rows: [
      person('Recipient', 'John Adebayo', '#a855f7'),
      bank('Bank', 'GTBank'),
      { label: 'Account number', value: '******4821' },
      { label: 'Transaction fee', value: '₦100' },
      { label: 'Total', value: '₦250,100' },
      { label: 'Date', value: WHEN },
      { label: 'Transaction ID', value: 'TXN-20260907-4KBP2M17', copy: true },
      { label: 'Reference', value: 'PAY-20260907-4821', copy: true },
      ...(reason ? [{ label: 'Failure reason', value: reason }] : []),
    ],
    footer: state === 'processing' ? 'refresh' : state === 'failed' ? 'support' : 'close',
  }
}

function wallet(amount: string, state: 'successful' | 'processing' | 'failed' | 'cancelled', banner?: string, reason?: string): TxDetail {
  return {
    headline: amount,
    banner: banner ? { tone: state === 'processing' ? 'warn' : 'danger', text: banner } : undefined,
    rows: [
      person('Recipient', 'John A · Contractor', '#7c5cff'),
      { label: 'Asset', value: 'USDC' },
      { label: 'Network', value: 'TRON' },
      { label: 'From', value: 'CoinMonie wallet' },
      { label: 'To', value: 'TJ4mN8pQ6rS2xV9kL5dC7h…', copy: true },
      { label: 'Fee', value: '1 USDC' },
      { label: 'Total', value: '501 USDC' },
      { label: 'Date', value: WHEN },
      { label: 'Transaction ID', value: 'TXN-20260907-9K4P2L86', copy: true },
      { label: 'Blockchain hash', value: '0x4b7e91c3a8d52f6e0b9c1…', copy: true },
      ...(reason ? [{ label: 'Failure reason', value: reason }] : []),
    ],
    footer: state === 'successful' ? 'chain' : state === 'processing' ? 'refresh' : state === 'failed' ? 'support' : 'close',
  }
}

function receiveFiat(state: 'successful' | 'processing' | 'failed', banner?: string, reason?: string): TxDetail {
  return {
    headline: '+₦250,000',
    banner: banner ? { tone: state === 'processing' ? 'warn' : 'danger', text: banner } : undefined,
    rows: [
      person('From', 'John Adebayo', '#a855f7'),
      bank('Bank', 'GTBank'),
      { label: 'Account number', value: '******4821' },
      { label: 'To', value: 'CoinMonie collection account' },
      { label: 'Transaction fee', value: '₦0' },
      { label: 'Date', value: WHEN },
      { label: 'Transaction ID', value: 'TXN-20260907-4KBP2M17', copy: true },
      { label: 'Payment reference', value: 'INV-2026-0917', copy: true },
      ...(reason ? [{ label: 'Failure reason', value: reason }] : []),
    ],
    footer: state === 'processing' ? 'refresh' : state === 'failed' ? 'support' : 'close',
  }
}

function receiveWallet(state: 'successful' | 'processing' | 'failed', banner?: string, reason?: string): TxDetail {
  return {
    headline: '+150 USDC',
    banner: banner ? { tone: state === 'processing' ? 'warn' : 'danger', text: banner } : undefined,
    rows: [
      { label: 'Network', value: 'TRON' },
      { label: 'From', value: 'TQ7aX9mK2vP4nR8cL6wY3…', copy: true },
      { label: 'To', value: 'CoinMonie wallet' },
      { label: 'Account', value: 'GTBank · 0123456789' },
      { label: 'Fee', value: '0 USDC' },
      { label: 'Date', value: WHEN },
      { label: 'Transaction ID', value: 'TXN-20260907-8F4K2M91', copy: true },
      { label: 'Blockchain hash', value: '0x8f4c2a7b91d6e3f05c8a1…', copy: true },
      ...(reason ? [{ label: 'Failure reason', value: reason }] : []),
    ],
    footer: state === 'successful' ? 'chain' : state === 'processing' ? 'refresh' : 'support',
  }
}

function conversion(state: 'successful' | 'processing' | 'failed' | 'cancelled', banner?: string, reason?: string): TxDetail {
  return {
    headline: '1,000 USDC → ₦1,520,000',
    centered: true,
    banner: banner ? { tone: state === 'processing' ? 'warn' : 'danger', text: banner } : undefined,
    rows: [
      { label: 'From', value: '1,000 USDC' },
      { label: 'To', value: '₦1,520,000' },
      { label: 'Exchange rate', value: '₦1,520 / USDC' },
      { label: 'Conversion fee', value: '₦1,520' },
      { label: 'Date', value: '7 Sep 2026, 4:00 PM' },
      { label: 'Transaction ID', value: 'TXN-20260907-2M8K4P71', copy: true },
      ...(reason ? [{ label: 'Failure reason', value: reason }] : []),
    ],
    footer: state === 'processing' ? 'refresh' : state === 'failed' ? 'support' : 'close',
  }
}

function withdrawal(state: 'successful' | 'processing' | 'failed' | 'cancelled', banner?: string, reason?: string): TxDetail {
  return {
    headline: '₦500,000',
    banner: banner ? { tone: state === 'processing' ? 'warn' : 'danger', text: banner } : undefined,
    rows: [
      bank('Bank', 'GTBank'),
      { label: 'Account number', value: '******4821' },
      person('Account name', 'John Adebayo', '#a855f7'),
      { label: 'Withdrawal fee', value: '₦100' },
      { label: 'Total deducted', value: '₦500,100' },
      { label: 'Date', value: '7 Sep 2026, 4:30 PM' },
      { label: 'Transaction ID', value: 'TXN-20260907-5P8K2M43', copy: true },
      { label: 'Reference', value: 'WDL-20260907-4821', copy: true },
      ...(reason ? [{ label: 'Failure reason', value: reason }] : []),
    ],
    footer: state === 'successful' ? 'receipt' : state === 'processing' ? 'refresh' : state === 'failed' ? 'support' : 'close',
  }
}

function bulk(state: 'successful' | 'processing' | 'failed', banner?: string, reason?: string): TxDetail {
  const processing = state === 'processing'
  const failed = state === 'failed'
  return {
    headline: '₦4,250,000',
    banner: banner ? { tone: processing ? 'warn' : 'danger', text: banner } : undefined,
    rows: [
      { label: 'Number of payouts', value: '100' },
      { label: 'Successful', value: failed ? '0' : processing ? '62' : '100', tone: 'successful' },
      { label: 'Failed', value: failed ? '100' : processing ? '2' : '0', tone: failed || processing ? 'failed' : undefined },
      ...(processing ? [{ label: 'Processing', value: '36', tone: 'processing' as const }] : []),
      person('Created by', 'Sarah Okafor', '#3b82f6'),
      { label: 'Completed on', value: WHEN },
      { label: 'Transaction ID', value: 'BULK-20260907-8K4P2M19', copy: true },
      ...(reason ? [{ label: 'Failure reason', value: reason }] : []),
    ],
    footer: state === 'successful' ? 'bulk-success' : processing ? 'bulk-processing' : 'bulk-failed',
  }
}
