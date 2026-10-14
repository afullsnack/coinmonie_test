import { passkeyClient } from '@better-auth/passkey/client'
import { createAuthClient } from 'better-auth/react'
import { emailOTPClient, inferAdditionalFields, organizationClient, twoFactorClient } from 'better-auth/client/plugins'

import { pinClient } from '#/lib/auth-plugins/pin-client'
import type { auth } from '#/lib/auth'

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    emailOTPClient(),
    // The sign-in page handles the 2FA hand-off itself, so no global redirect.
    twoFactorClient(),
    organizationClient(),
    passkeyClient(),
    pinClient(),
  ],
})

export type AuthErrorCode = keyof typeof authClient.$ERROR_CODES

/** Human message for a better-auth client error. */
export function authErrorMessage(error: { message?: string; code?: string } | null | undefined, fallback = 'Something went wrong. Try again.') {
  return error?.message || fallback
}

/** Re-read the session from the database and notify `useSession` subscribers. */
export async function refreshSession() {
  await authClient.getSession({ query: { disableCookieCache: true } })
  authClient.$store.notify('$sessionSignal')
}
