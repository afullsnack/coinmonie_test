import { createFileRoute } from '@tanstack/react-router'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { db } from '#/db'
import { transactions, webhookEvents } from '#/db/schema'
import { and, eq, notInArray } from 'drizzle-orm'
import { env } from '#/env'
import { checkRateLimit } from '#/lib/rate-limit'
import { LOCKED_STATUSES } from '#/lib/transaction-status'

function verifySignature(rawBody: string, signatureHeader: string | null) {
	if (!signatureHeader) return false

	const expected = createHmac('sha256', env.SWITCH_API_KEY).update(rawBody, 'utf8').digest('hex')

	const a = Buffer.from(expected, 'utf8')
	const b = Buffer.from(signatureHeader.trim(), 'utf8')

	return a.length === b.length && timingSafeEqual(a, b)
}

async function handleWebhook(request: Request) {
	if (await checkRateLimit(request, 'webhook', 60, 60_000)) {
		return new Response('Too many requests', { status: 429 })
	}

	const rawBody = await request.text()
	const signatureHeader = request.headers.get('x-switch-signature')
	const signatureValid = verifySignature(rawBody, signatureHeader)

	// Tighter rate limit for unsigned requests to avoid audit-log flooding.
	if (!signatureValid) {
		if (await checkRateLimit(request, 'webhook-invalid', 5, 60_000)) {
			return new Response('Invalid signature', { status: 401 })
		}

		let invalidJson: any = null
		try {
			invalidJson = JSON.parse(rawBody)
		} catch {
			// still log the unparsable request
		}

		await db.insert(webhookEvents).values({
			source: 'switch',
			eventType: 'invalid-signature',
			signatureValid: false,
			payload: invalidJson ?? { raw: rawBody.slice(0, 2000) },
		})

		return new Response('Invalid signature', { status: 401 })
	}

	let json: any
	try {
		json = JSON.parse(rawBody)
	} catch {
		return new Response('Invalid JSON', { status: 400 })
	}

	// Wallet events lack `reference`; payment events have it.
	const isPaymentEvent = typeof json.reference === 'string' && typeof json.status === 'string'
	const isWalletEvent = !isPaymentEvent && typeof json.hash === 'string' && typeof json.address === 'string'

	const paymentHash: string | null = isPaymentEvent ? json.meta?.hash ?? null : null
	const explorerUrl: string | null = isPaymentEvent ? json.meta?.explorer_url ?? null : null
	// Settled amount can differ from the quote (sender deposits a different amount).
	const sourceAmount: string | null = isPaymentEvent && typeof json.source?.amount === 'number' ? String(json.source.amount) : null
	const destAmount: string | null = isPaymentEvent && typeof json.destination?.amount === 'number' ? String(json.destination.amount) : null

	await db.insert(webhookEvents).values({
		source: 'switch',
		eventType: isPaymentEvent ? 'payment' : isWalletEvent ? 'wallet' : 'unknown',
		reference: isPaymentEvent ? json.reference : null,
		depositAddress: isPaymentEvent ? json.deposit?.address ?? null : (isWalletEvent ? json.address : null),
		transactionHash: isPaymentEvent ? paymentHash : (isWalletEvent ? json.hash : null),
		signatureValid: true,
		payload: json,
	})

	if (isPaymentEvent) {
		await db.update(transactions)
			.set({
				status: json.status,
				...(paymentHash ? { transactionHash: paymentHash } : {}),
				...(explorerUrl ? { explorerUrl } : {}),
				...(sourceAmount ? { sourceAmount } : {}),
				...(destAmount ? { destAmount } : {}),
			})
			.where(and(
				eq(transactions.reference, json.reference),
				notInArray(transactions.status, LOCKED_STATUSES),
			))
	}

	if (isWalletEvent && json.type === 'receive') {
		await db.update(transactions)
			.set({ transactionHash: json.hash })
			.where(eq(transactions.depositAddress, json.address))
	}

	return new Response('OK', { status: 200 })
}

export const Route = createFileRoute('/api/webhooks/switch')({
	server: {
		handlers: {
			POST: ({ request }) => handleWebhook(request),
		},
	},
})
