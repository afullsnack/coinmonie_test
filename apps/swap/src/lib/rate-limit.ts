import { env } from '#/env'

type Bucket = { count: number; resetAt: number }

// In-memory fallback for environments without a shared KV store (local dev,
// or a single long-running Node process where per-instance memory is fine).
const memoryBuckets = new Map<string, Bucket>()
let cleanupIntervalStarted = false

function ensureCleanupInterval() {
	// Workers forbid starting timers outside a request handler, so this is
	// lazily started on first real use rather than at module load time.
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

// Cloudflare's Workers runtime attaches `env`/`context` directly onto the
// incoming Request object (see nitro's cloudflare-module preset). When a
// `RATE_LIMIT_KV` binding is present we use it so limits are shared across
// isolates; otherwise we fall back to the in-memory bucket above.
type CloudflareKvNamespace = {
	get(key: string): Promise<string | null>
	put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>
}

function getKv(request: Request): CloudflareKvNamespace | null {
	const runtime = (request as unknown as { runtime?: { cloudflare?: { env?: Record<string, unknown> } } }).runtime
	const kv = runtime?.cloudflare?.env?.RATE_LIMIT_KV
	return (kv as CloudflareKvNamespace | undefined) ?? null
}

async function isRateLimitedInKv(kv: CloudflareKvNamespace, key: string, limit: number, windowMs: number): Promise<boolean> {
	const now = Date.now()
	const raw = await kv.get(key)
	const bucket: Bucket = raw ? JSON.parse(raw) : { count: 0, resetAt: now + windowMs }

	if (bucket.resetAt <= now) {
		bucket.count = 0
		bucket.resetAt = now + windowMs
	}

	bucket.count += 1
	await kv.put(key, JSON.stringify(bucket), { expirationTtl: Math.ceil(windowMs / 1000) + 5 })

	return bucket.count > limit
}

export function getClientIp(request: Request): string {
	// cf-connecting-ip is set by Cloudflare's edge and cannot be spoofed by the
	// client. x-forwarded-for can be freely set by any caller, so it's only
	// trusted as a fallback for non-Cloudflare deployments (e.g. behind a
	// trusted reverse proxy), never preferred over it.
	const cfConnectingIp = request.headers.get('cf-connecting-ip')
	if (cfConnectingIp) return cfConnectingIp.trim()

	const forwarded = request.headers.get('x-forwarded-for')
	if (forwarded) return forwarded.split(',')[0]!.trim()

	return request.headers.get('x-real-ip') ?? 'unknown'
}

export async function checkRateLimit(request: Request, scope: string, limit: number, windowMs: number): Promise<boolean> {
	if (!env.FEATURE_FLAG_RATE_LIMIT) return false

	const key = `ratelimit:${scope}:${getClientIp(request)}`
	const kv = getKv(request)

	return kv ? await isRateLimitedInKv(kv, key, limit, windowMs) : isRateLimitedInMemory(key, limit, windowMs)
}

export async function enforceRateLimit(request: Request, scope: string, limit: number, windowMs: number) {
	if (await checkRateLimit(request, scope, limit, windowMs)) {
		throw new Error('Too many requests. Please try again in a minute.')
	}
}
