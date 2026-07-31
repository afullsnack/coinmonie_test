import { betterFetch } from '@better-fetch/fetch'
import { and, eq, notInArray } from 'drizzle-orm'
import { db } from '#/db'
import { transactions } from '#/db/schema'
import { env } from '#/env'
import { LOCKED_STATUSES } from '#/lib/transaction-status'

const SWITCH_API_URL = env.SWITCH_API_URL

// Skip anything younger than this — still probably mid-flow.
const MIN_AGE_MS = 10 * 60 * 1000
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

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

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
	let updated = 0

	for (const transaction of stuck) {
		if (checked > 0) await sleep(CALL_DELAY_MS)
		checked++

		const { data: result, error } = await betterFetch<SwitchPaymentStatus>(
			`${SWITCH_API_URL}/payment/status?reference=${transaction.reference}`,
			{ headers: { 'x-service-key': env.SWITCH_API_KEY } },
		)

		if (error || !result?.success) continue

		const liveStatus = result.data.status
		if (liveStatus === transaction.status) continue

		const paymentHash = result.data.meta?.hash ?? null
		const explorerUrl = result.data.meta?.explorer_url ?? null

		const updateResult = await db.update(transactions)
			.set({
				status: liveStatus,
				...(paymentHash ? { transactionHash: paymentHash } : {}),
				...(explorerUrl ? { explorerUrl } : {}),
			})
			.where(
				and(
					eq(transactions.reference, transaction.reference),
					notInArray(transactions.status, LOCKED_STATUSES),
				),
			)
			.returning({ reference: transactions.reference })

		if (updateResult.length > 0) updated++
	}

	return { checked, updated }
}
