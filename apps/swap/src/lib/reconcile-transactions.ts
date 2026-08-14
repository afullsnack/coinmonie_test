import { betterFetch } from '@better-fetch/fetch'
import { db } from '#/db'
import { env } from '#/env'
import { LOCKED_STATUSES } from '#/lib/transaction-status'

const SWITCH_API_URL = env.SWITCH_API_URL

// Skip anything younger than this — still probably mid-flow.
// Kept short since the cron itself now runs every 2 min (see vite.config.ts);
// a wider floor would just re-introduce the delay this task exists to avoid.
const MIN_AGE_MS = 2 * 60 * 1000
// Skip anything older than this — needs a human, not a retry loop.
const MAX_AGE_MS = 24 * 60 * 60 * 1000
// Spacing between Switch calls so a large backlog doesn't trip their rate limit.
const CALL_DELAY_MS = 250

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
// from ours (the tell-tale sign of a missed webhook), asks Switch to resend
// the webhook rather than writing the status ourselves. That way the update
// still flows through /api/webhooks/switch — signature-verified and logged
// to webhook_events — instead of a second, untracked write path.
export async function reconcileStuckTransactions() {
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

		// Status has drifted from Switch's — our webhook was missed. Ask Switch
		// to redeliver it instead of patching the row ourselves.
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
}
