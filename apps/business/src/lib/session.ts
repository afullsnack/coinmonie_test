import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

/** Current better-auth session (or null), read from the request cookies. */
export const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  const { auth } = await import('#/lib/auth')
  return auth.api.getSession({ headers: getRequestHeaders() })
})

export type AppSession = NonNullable<Awaited<ReturnType<typeof getSession>>>

/** `beforeLoad` guard: signed-in users only, remembering where they were going. */
export async function requireSession({ location }: { location: { href: string } }) {
  const session = await getSession()
  if (!session) {
    throw redirect({ to: '/signin', search: { redirect: location.href } })
  }
  return { session }
}

/** `beforeLoad` guard for sign-in/up pages: send signed-in users to the app. */
export async function redirectIfSignedIn() {
  const session = await getSession()
  if (session) throw redirect({ to: '/dashboard' })
}
