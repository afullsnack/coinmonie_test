import { db } from '#/db'
import { waitlistSignups } from '#/db/schema'
import { requireAdminSession } from '#/lib/require-admin-session'
import { enforceRateLimit } from '#/lib/rate-limit'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'

export const joinWaitlist = createServerFn({ method: 'POST' })
	.validator(z.object({ email: z.string().email() }))
	.handler(async ({ data }) => {
		await enforceRateLimit(getRequest(), 'waitlist', 5, 60_000)

		await db
			.insert(waitlistSignups)
			.values({ email: data.email.toLowerCase() })
			.onConflictDoNothing()

		return { success: true }
	})

export const adminListWaitlist = createServerFn({ method: 'GET' })
	.handler(async () => {
		await requireAdminSession()
		return await db.query.waitlistSignups.findMany({
			orderBy: (waitlistSignups, { desc }) => desc(waitlistSignups.createdAt),
		})
	})
