import { env } from '#/env'

type Bucket = { count: number; resetAt: number }

// In-memory rate-limit buckets, per isolate.
const memoryBuckets = new Map<string, Bucket>()
let cleanupIntervalStarted = false

function ensureCleanupInterval() {
	// Lazy start: Workers forbid timers outside a request handler.
	if (cleanupIntervalStarted) return
	cleanupIntervalStarted = true
	setInterval(() => {
		const now = Date.now()
		for (const [key, bucket] of memoryBuckets) {
			if (bucket.resetAt <= now) memoryBuckets.delete(key)
		}
	}, 60_000).unref?.()
}

function isRateLimitedInMemory(key: string, limit: number, windowMs: number): boolean {
	ensureCleanupInterval()
	const now = Date.now()
	const bucket = memoryBuckets.get(key)

	if (!bucket || bucket.resetAt <= now) {
		memoryBuckets.set(key, { count: 1, resetAt: now + windowMs })
		return false
	}

	bucket.count += 1
	return bucket.count > limit
}

export function getClientIp(request: Request): string {
	// cf-connecting-ip can't be spoofed by the client, unlike x-forwarded-for.
	const cfConnectingIp = request.headers.get('cf-connecting-ip')
	if (cfConnectingIp) return cfConnectingIp.trim()

	const forwarded = request.headers.get('x-forwarded-for')
	if (forwarded) return forwarded.split(',')[0]!.trim()

	return request.headers.get('x-real-ip') ?? 'unknown'
}

export async function checkRateLimit(request: Request, scope: string, limit: number, windowMs: number): Promise<boolean> {
	if (!env.FEATURE_FLAG_RATE_LIMIT) return false

	const key = `ratelimit:${scope}:${getClientIp(request)}`
	return isRateLimitedInMemory(key, limit, windowMs)
}

export async function enforceRateLimit(request: Request, scope: string, limit: number, windowMs: number) {
	if (await checkRateLimit(request, scope, limit, windowMs)) {
		throw new Error('Too many requests. Please try again in a minute.')
	}
}
