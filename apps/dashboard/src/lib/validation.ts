import { z } from 'zod'

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const PASSWORD_MIN_LENGTH = 8

export type PasswordStrength = 'weak' | 'fair' | 'strong'

/** Weak below the minimum length, fair until it mixes letters, numbers and a symbol. */
export function passwordStrength(password: string): PasswordStrength | null {
  if (password.length === 0) return null
  if (password.length < PASSWORD_MIN_LENGTH) return 'weak'
  const hasLetter = /[a-z]/i.test(password)
  const hasNumber = /\d/.test(password)
  const hasSymbol = /[^a-z0-9]/i.test(password)
  return hasLetter && hasNumber && hasSymbol ? 'strong' : 'fair'
}

export const PASSWORD_HINT: Record<PasswordStrength, string> = {
  weak: 'Password too short',
  fair: 'Password not strong enough, add a symbol',
  strong: 'Password looks good',
}

export const pinSchema = z.string().regex(/^\d{6}$/, 'PIN must be 6 digits')
export const otpSchema = z.string().regex(/^\d{6}$/, 'Code must be 6 digits')

export const signUpSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH)
    .refine((value) => passwordStrength(value) === 'strong', 'Password not strong enough'),
})

export const signInSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
})
