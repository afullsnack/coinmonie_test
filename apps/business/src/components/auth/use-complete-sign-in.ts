import { useRouter } from '@tanstack/react-router'

import { authClient } from '#/lib/auth-client'
import { firstNameOf, rememberAccount } from '#/lib/last-account'
import { safeRedirect } from '#/lib/redirect'

/**
 * After any successful sign-in: remember the account for the returning-user
 * screens, refresh route guards, then continue to `redirect`.
 */
export function useCompleteSignIn() {
  const router = useRouter()
  return async (redirect?: string, fallback?: string) => {
    const { data } = await authClient.getSession({ query: { disableCookieCache: true } })
    if (data) {
      rememberAccount({
        email: data.user.email,
        firstName: firstNameOf(data.user),
        pin: Boolean(data.user.pinLoginEnabled),
      })
    }
    await router.invalidate()
    await router.navigate({ to: safeRedirect(redirect, fallback) })
  }
}
