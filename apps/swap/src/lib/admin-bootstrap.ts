import { db } from '#/db'
import { account, user } from '#/db/schema'
import { hashPassword } from 'better-auth/crypto'
import { env } from '#/env'

let bootstrapped = false

export async function ensureAdminUser() {
	if (bootstrapped) return
	bootstrapped = true

	if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) return

	const normalizedEmail = env.ADMIN_EMAIL.toLowerCase()

	const existing = await db.query.user.findFirst({
		where: (user, { eq }) => eq(user.email, normalizedEmail),
	})
	if (existing) return

	const userId = crypto.randomUUID()
	const hashed = await hashPassword(env.ADMIN_PASSWORD)

	await db.insert(user).values({
		id: userId,
		name: 'Admin',
		email: normalizedEmail,
		emailVerified: true,
	})

	await db.insert(account).values({
		id: crypto.randomUUID(),
		accountId: userId,
		providerId: 'credential',
		userId,
		password: hashed,
	})
}
