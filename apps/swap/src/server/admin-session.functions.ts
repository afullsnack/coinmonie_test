import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { auth } from '#/lib/auth'
import { env } from '#/env'
import { ensureAdminUser } from '#/lib/admin-bootstrap'

export const getAdminSession = createServerFn({ method: 'GET' }).handler(async () => {
	if (!env.FEATURE_FLAG_ADMIN_DASHBOARD) {
		return { enabled: false as const, session: null }
	}

	try {
		await ensureAdminUser()
	} catch (error) {
		console.error('[getAdminSession] ensureAdminUser failed', error)
		throw error
	}

	try {
		const request = getRequest()
		const session = await auth.api.getSession({ headers: request.headers })
		return { enabled: true as const, session }
	} catch (error) {
		console.error('[getAdminSession] auth.api.getSession failed', error)
		throw error
	}
})
