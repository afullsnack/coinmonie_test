import { createFileRoute } from '@tanstack/react-router'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { db } from '#/db'
import { transactions, webhookEvents } from '#/db/schema'
import { and, eq, notInArray } from 'drizzle-orm'
import { env } from '#/env'
import { checkRateLimit } from '#/lib/rate-limit'

// Once a transaction reaches a terminal state, a replayed (previously valid,
// captured-and-resent) webhook must not be able to move it backward — e.g.
// re-applying a stale COMPLETED event over a later FAILED one, or vice versa.
const TERMINAL_STATUSES = ['COMPLETED', 'FAILED']

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

	// Unsigned/forged requests get a much tighter budget for how many we'll
	// bother persisting to the audit log — enough to see an attack pattern
	// without letting an attacker use this endpoint to flood the database.
	if (!signatureValid) {
		if (await checkRateLimit(request, 'webhook-invalid', 5, 60_000)) {
			return new Response('Invalid signature', { status: 401 })
		}

		let invalidJson: any = null
		try {
			invalidJson = JSON.parse(rawBody)
		} catch {
			// still worth recording that an unparsable request hit this endpoint
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

	// Payment webhooks are a flat payload: { status, reference, deposit, meta,
	// source, destination, type, ... } — no wrapping envelope. Wallet-only
	// events (raw deposit notifications) are also flat but lack `reference`.
	const isPaymentEvent = typeof json.reference === 'string' && typeof json.status === 'string'
	const isWalletEvent = !isPaymentEvent && typeof json.hash === 'string' && typeof json.address === 'string'

	const paymentHash: string | null = isPaymentEvent ? json.meta?.hash ?? null : null

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
			})
			.where(and(
				eq(transactions.reference, json.reference),
				notInArray(transactions.status, TERMINAL_STATUSES),
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
