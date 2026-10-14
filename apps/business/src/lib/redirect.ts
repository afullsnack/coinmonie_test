import { z } from 'zod'

/** Same-origin path only; anything else falls back to the dashboard. */
export function safeRedirect(target: string | undefined, fallback = '/dashboard') {
  if (!target || !target.startsWith('/') || target.startsWith('//') || target.startsWith('/\\')) return fallback
  return target
}

export const redirectSearch = z.object({ redirect: z.string().optional() })
