import { getRequest } from '@tanstack/react-start/server'
import { auth } from '#/lib/auth'
import { env } from '#/env'

export async function requireAdminSession() {
	if (!env.FEATURE_FLAG_ADMIN_DASHBOARD) {
		throw new Error('Admin dashboard is disabled')
	}

	const request = getRequest()
	const session = await auth.api.getSession({ headers: request.headers })
	if (!session) {
		throw new Error('Unauthorized')
	}
	return session
}

export function isSuperAdmin(email: string) {
	return Boolean(env.ADMIN_EMAIL) && email.toLowerCase() === env.ADMIN_EMAIL?.toLowerCase()
}

export async function requireSuperAdminSession() {
	const session = await requireAdminSession()
	if (!isSuperAdmin(session.user.email)) {
		throw new Error('Only the super admin can perform this action')
	}
	return session
}
