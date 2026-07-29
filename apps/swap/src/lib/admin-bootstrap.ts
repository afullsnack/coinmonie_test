import { db } from '#/db'
import { user } from '#/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '#/lib/auth'
import { env } from '#/env'

let bootstrapped = false

export async function ensureAdminUser() {
	if (bootstrapped) return
	bootstrapped = true

	if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) return

	const existing = await db.query.user.findFirst({
		where: eq(user.email, env.ADMIN_EMAIL),
	})
	if (existing) return

	await auth.api.signUpEmail({
		body: {
			email: env.ADMIN_EMAIL,
			password: env.ADMIN_PASSWORD,
			name: 'Admin',
		},
	})
}
