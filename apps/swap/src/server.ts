import {
	createStartHandler,
	defaultStreamHandler,
} from '@tanstack/react-start/server'
import type { Register } from '@tanstack/react-router'
import type { RequestHandler } from '@tanstack/react-start/server'
import { applySecurityHeaders } from '#/lib/security-headers'
import { enforceRateLimit } from '#/lib/rate-limit'

const handler = createStartHandler(defaultStreamHandler)

export type ServerEntry = { fetch: RequestHandler<Register> }

export function createServerEntry(entry: ServerEntry): ServerEntry {
	return {
		async fetch(request: Request, ...rest) {
			try {
				await enforceRateLimit(request, 'global', 300, 60_000)
			} catch {
				return applySecurityHeaders(new Response('Too many requests', { status: 429 }))
			}

			const response = await entry.fetch(request, ...rest)
			return applySecurityHeaders(response)
		},
	}
}

export default createServerEntry({ fetch: handler })
