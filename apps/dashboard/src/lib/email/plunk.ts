import { env } from '#/env'

type Address = string | { name?: string; email: string }

/** Value sent for this email only — Plunk won't store it on the contact. */
type TransientValue = { value: string | number | boolean; persistent: false }

export type PlunkSendInput = {
  to: Address | Address[]
  subject: string
  /** HTML body; Plunk derives the plain-text part from it. */
  body: string
  from?: Address
  reply?: string
  data?: Record<string, string | number | boolean | null | TransientValue>
  headers?: Record<string, string>
  idempotencyKey?: string
}

type PlunkError = {
  success: false
  error: { code: string; message: string; statusCode: number; requestId?: string }
}

type PlunkSuccess = {
  success: true
  data: { emails: Array<{ contact: { id: string; email: string }; email: string }>; timestamp: string }
}

export class PlunkRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly requestId?: string,
  ) {
    super(message)
    this.name = 'PlunkRequestError'
  }
}

/**
 * Sends a transactional email through Plunk (`POST /v1/send`).
 * https://docs.useplunk.com/api-reference/public-api/sendEmail
 */
export async function sendWithPlunk(input: PlunkSendInput): Promise<PlunkSuccess['data']> {
  if (!env.PLUNK_SECRET_KEY) {
    throw new PlunkRequestError('PLUNK_SECRET_KEY is not configured', 500, 'MISSING_API_KEY')
  }

  const { idempotencyKey, from, ...rest } = input
  const response = await fetch(new URL('/v1/send', env.PLUNK_API_URL), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.PLUNK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: JSON.stringify({
      ...rest,
      from,
      // Auth mail must not opt anyone into marketing.
      subscribed: true,
    }),
  })

  const payload = (await response.json().catch(() => null)) as PlunkSuccess | PlunkError | null
  if (!response.ok || !payload?.success) {
    const error = payload && !payload.success ? payload.error : undefined
    throw new PlunkRequestError(
      error?.message ?? `Plunk responded with ${response.status}`,
      response.status,
      error?.code,
      error?.requestId,
    )
  }
  return payload.data
}
