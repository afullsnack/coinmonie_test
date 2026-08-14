import { betterFetch } from '@better-fetch/fetch'
import { eq, lt, or } from 'drizzle-orm'
import { db } from '#/db'
import { appSettings } from '#/db/schema'
import { env } from '#/env'
import { LOCKED_STATUSES } from '#/lib/transaction-status'

const SWITCH_API_URL = env.SWITCH_API_URL

// Kept short since the cron itself now runs every 2 min (see vite.config.ts);
// a wider floor would just re-introduce the delay this task exists to avoid.
const MIN_AGE_MS = 2 * 60 * 1000
// Beyond this, needs a human, not a retry loop.
const MAX_AGE_MS = 24 * 60 * 60 * 1000
const CALL_DELAY_MS = 250

// Neon's HTTP driver has no persistent session, so pg_try_advisory_lock isn't
// usable here (it'd release before the next query) — use a row-based lock instead.
const LOCK_KEY = 'transactions:reconcile:lock'
const LOCK_TTL_MS = 5 * 60 * 1000

async function acquireLock(): Promise<boolean> {
	const now = new Date()
	const expiredBefore = new Date(now.getTime() - LOCK_TTL_MS)

	const claimed = await db
		.insert(appSettings)
		.values({ key: LOCK_KEY, value: 'locked', updatedAt: now })
		.onConflictDoUpdate({
			target: appSettings.key,
			set: { value: 'locked', updatedAt: now },
			where: or(eq(appSettings.value, 'unlocked'), lt(appSettings.updatedAt, expiredBefore)),
		})
		.returning({ key: appSettings.key })

	return claimed.length > 0
}

async function releaseLock() {
	await db.update(appSettings).set({ value: 'unlocked' }).where(eq(appSettings.key, LOCK_KEY))
}

type SwitchPaymentStatus = {
	success: boolean
	data: {
		status: 'AWAITING_DEPOSIT' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
		meta?: { hash?: string; explorer_url?: string }
	}
}

type SwitchWebhookResend = {
	success: boolean
	data: { successful: boolean } | null
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

// Checks Switch's live status for stuck transactions and, when it has drifted
// from ours (a missed webhook), asks Switch to resend it rather than writing
// the status ourselves — keeps the update flowing through
// /api/webhooks/switch, signature-verified and logged to webhook_events.
export async function reconcileStuckTransactions() {
	if (!(await acquireLock())) {
		return { checked: 0, resent: 0, skipped: 'already running' as const }
	}

	try {
		const now = Date.now()
		const stuck = await db.query.transactions.findMany({
			where: (t, { and: andCols, notInArray: notInArrayCol, lt: ltCol, gt: gtCol }) =>
				andCols(
					notInArrayCol(t.status, LOCKED_STATUSES),
					ltCol(t.createdAt, new Date(now - MIN_AGE_MS)),
					gtCol(t.createdAt, new Date(now - MAX_AGE_MS)),
				),
			columns: { reference: true, status: true },
		})

		let checked = 0
		let resent = 0

		for (const transaction of stuck) {
			if (checked > 0) await sleep(CALL_DELAY_MS)
			checked++

			const { data: result, error } = await betterFetch<SwitchPaymentStatus>(
				`${SWITCH_API_URL}/payment/status?reference=${transaction.reference}`,
				{ headers: { 'x-service-key': env.SWITCH_API_KEY } },
			)

			if (error || !result?.success) continue
			if (result.data.status === transaction.status) continue

			const { data: resendResult, error: resendError } = await betterFetch<SwitchWebhookResend>(
				`${SWITCH_API_URL}/webhook/resend`,
				{
					method: 'POST',
					headers: { 'x-service-key': env.SWITCH_API_KEY },
					body: { reference: transaction.reference },
				},
			)

			if (!resendError && resendResult?.success && resendResult.data?.successful) resent++
		}

		return { checked, resent }
	} finally {
		await releaseLock()
	}
}
