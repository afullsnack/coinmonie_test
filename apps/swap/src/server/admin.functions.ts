import { db } from '#/db'
import { account, appSettings, user } from '#/db/schema'
import { requireAdminSession, requireSuperAdminSession, isSuperAdmin } from '#/lib/require-admin-session'
import { getDeveloperFee, DEVELOPER_FEE_ENABLED_KEY, DEVELOPER_FEE_PERCENT_KEY } from '#/lib/developer-fee'
import { hashPassword } from 'better-auth/crypto'
import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

const ADMIN_EMAIL_DOMAIN = '@coinmonie.com'

export const getDeveloperFeeSettings = createServerFn({ method: 'GET' })
	.handler(async () => {
		await requireAdminSession()
		return await getDeveloperFee()
	})

export const updateDeveloperFeeSettings = createServerFn({ method: 'POST' })
	.validator(z.object({ enabled: z.boolean(), percent: z.number().min(0).max(100) }))
	.handler(async ({ data }) => {
		await requireSuperAdminSession()

		await db.insert(appSettings)
			.values({ key: DEVELOPER_FEE_ENABLED_KEY, value: String(data.enabled) })
			.onConflictDoUpdate({ target: appSettings.key, set: { value: String(data.enabled) } })

		await db.insert(appSettings)
			.values({ key: DEVELOPER_FEE_PERCENT_KEY, value: String(data.percent) })
			.onConflictDoUpdate({ target: appSettings.key, set: { value: String(data.percent) } })

		return { success: true }
	})

export const listAdmins = createServerFn({ method: 'GET' })
	.handler(async () => {
		const session = await requireAdminSession()

		const admins = await db.query.user.findMany({
			columns: { id: true, name: true, email: true, createdAt: true, mustChangePassword: true },
			orderBy: (user, { asc }) => asc(user.createdAt),
		})

		return {
			admins,
			canManage: isSuperAdmin(session.user.email),
		}
	})

export const addAdmin = createServerFn({ method: 'POST' })
	.validator(
		z.object({
			email: z.string().email(),
			password: z.string().min(8),
			name: z.string().min(1),
		}),
	)
	.handler(async ({ data }) => {
		await requireSuperAdminSession()

		if (!data.email.toLowerCase().endsWith(ADMIN_EMAIL_DOMAIN)) {
			throw new Error(`Admin accounts must use a ${ADMIN_EMAIL_DOMAIN} email address`)
		}

		const normalizedEmail = data.email.toLowerCase()

		const existing = await db.query.user.findFirst({
			where: (user, { eq }) => eq(user.email, normalizedEmail),
		})
		if (existing) {
			throw new Error('An account with this email already exists')
		}

		const userId = crypto.randomUUID()
		const hashed = await hashPassword(data.password)

		await db.insert(user).values({
			id: userId,
			name: data.name,
			email: normalizedEmail,
			emailVerified: true,
			mustChangePassword: true,
		})

		await db.insert(account).values({
			id: crypto.randomUUID(),
			accountId: userId,
			providerId: 'credential',
			userId,
			password: hashed,
		})

		return { success: true }
	})

export const resetAdminPassword = createServerFn({ method: 'POST' })
	.validator(z.object({ userId: z.string(), password: z.string().min(8) }))
	.handler(async ({ data }) => {
		const session = await requireSuperAdminSession()

		const target = await db.query.user.findFirst({ where: eq(user.id, data.userId) })
		if (!target) {
			throw new Error('Admin not found')
		}
		if (target.id === session.user.id) {
			throw new Error('Use your own account settings to change your password')
		}

		const hashed = await hashPassword(data.password)

		await db.update(account)
			.set({ password: hashed })
			.where(and(eq(account.userId, data.userId), eq(account.providerId, 'credential')))

		await db.update(user)
			.set({ mustChangePassword: true })
			.where(eq(user.id, data.userId))

		return { success: true }
	})

export const deleteAdmin = createServerFn({ method: 'POST' })
	.validator(z.object({ userId: z.string() }))
	.handler(async ({ data }) => {
		const session = await requireSuperAdminSession()

		if (data.userId === session.user.id) {
			throw new Error('You cannot delete your own account')
		}

		await db.delete(user).where(eq(user.id, data.userId))

		return { success: true }
	})

export const changeOwnPassword = createServerFn({ method: 'POST' })
	.validator(z.object({ password: z.string().min(8) }))
	.handler(async ({ data }) => {
		const session = await requireAdminSession()

		const hashed = await hashPassword(data.password)

		await db.update(account)
			.set({ password: hashed })
			.where(and(eq(account.userId, session.user.id), eq(account.providerId, 'credential')))

		await db.update(user)
			.set({ mustChangePassword: false })
			.where(eq(user.id, session.user.id))

		return { success: true }
	})
