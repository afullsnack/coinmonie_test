import { db } from '#/db'
import { account, user } from '#/db/schema'
import { auth } from '#/lib/auth'
import { requireAdminSession, requireSuperAdminSession, isSuperAdmin } from '#/lib/require-admin-session'
import { hashPassword } from 'better-auth/crypto'
import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const ADMIN_EMAIL_DOMAIN = '@coinmonie.com'

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

		const existing = await db.query.user.findFirst({
			where: (user, { eq }) => eq(user.email, data.email),
		})
		if (existing) {
			throw new Error('An account with this email already exists')
		}

		await auth.api.signUpEmail({
			body: {
				email: data.email,
				password: data.password,
				name: data.name,
			},
		})

		await db.update(user)
			.set({ mustChangePassword: true })
			.where(eq(user.email, data.email))

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
			.where(eq(account.userId, data.userId))

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
			.where(eq(account.userId, session.user.id))

		await db.update(user)
			.set({ mustChangePassword: false })
			.where(eq(user.id, session.user.id))

		return { success: true }
	})
