import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { z } from 'zod'

const COOKIE = 'cm_last_account'
const MAX_AGE = 60 * 60 * 24 * 365

const lastAccountSchema = z.object({
  email: z.email(),
  firstName: z.string().max(80),
  pin: z.boolean().default(false),
})

/** Who signed in last on this device; drives the "Welcome, Frieda" screens. */
export type LastAccount = z.infer<typeof lastAccountSchema>

export const getLastAccount = createServerFn({ method: 'GET' }).handler(() => {
  const raw = getCookie(COOKIE)
  if (!raw) return null
  try {
    const parsed = lastAccountSchema.safeParse(JSON.parse(decodeURIComponent(raw)))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
})

export function rememberAccount(account: LastAccount) {
  const value = encodeURIComponent(JSON.stringify(account))
  document.cookie = `${COOKIE}=${value}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`
}

export function updateRememberedAccount(patch: Partial<LastAccount>) {
  const current = readClientCookie()
  if (current) rememberAccount({ ...current, ...patch })
}

export function forgetAccount() {
  document.cookie = `${COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`
}

function readClientCookie(): LastAccount | null {
  const match = document.cookie.split('; ').find((part) => part.startsWith(`${COOKIE}=`))
  if (!match) return null
  try {
    const parsed = lastAccountSchema.safeParse(JSON.parse(decodeURIComponent(match.slice(COOKIE.length + 1))))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export function firstNameOf(user: { firstName?: string | null; name: string }) {
  return user.firstName || user.name.split(' ')[0] || user.name
}
