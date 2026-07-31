const SWITCH_API_HOST = 'api.onswitch.xyz'

export function applySecurityHeaders(response: Response) {
	const isDev = process.env.NODE_ENV !== 'production'

	// Clickjacking protection: never allow this app to be framed.
	response.headers.set('X-Frame-Options', 'DENY')
	response.headers.set('Content-Security-Policy', [
		"default-src 'self'",
		"frame-ancestors 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		"object-src 'none'",
		`connect-src 'self' https://${SWITCH_API_HOST}`,
		"img-src 'self' data: https:",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
		"font-src 'self' data: https://fonts.gstatic.com",
		// unsafe-eval is dev-only, needed by Vite's module runner.
		isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self' 'unsafe-inline'",
	].join('; '))

	// MITM / transport hardening.
	response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
	response.headers.set('X-Content-Type-Options', 'nosniff')
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
	response.headers.set('Permissions-Policy', 'geolocation=(), camera=(), microphone=(), payment=()')
	response.headers.set('X-XSS-Protection', '0')
	response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
	response.headers.set('Cross-Origin-Resource-Policy', 'same-origin')

	return response
}
