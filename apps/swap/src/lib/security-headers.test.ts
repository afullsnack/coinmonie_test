import { afterEach, describe, expect, it } from "vitest";
import { applySecurityHeaders } from "./security-headers";

describe("applySecurityHeaders", () => {
	const originalEnv = process.env.NODE_ENV;

	afterEach(() => {
		process.env.NODE_ENV = originalEnv;
	});

	it("sets clickjacking and MITM hardening headers", () => {
		const response = applySecurityHeaders(new Response("ok"));

		expect(response.headers.get("X-Frame-Options")).toBe("DENY");
		expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
		expect(response.headers.get("Strict-Transport-Security")).toContain(
			"max-age=63072000",
		);
		expect(response.headers.get("Referrer-Policy")).toBe(
			"strict-origin-when-cross-origin",
		);
		expect(response.headers.get("Cross-Origin-Opener-Policy")).toBe(
			"same-origin",
		);
		expect(response.headers.get("Cross-Origin-Resource-Policy")).toBe(
			"same-origin",
		);
	});

	it("allows connections to the Switch API in the CSP", () => {
		const response = applySecurityHeaders(new Response("ok"));
		const csp = response.headers.get("Content-Security-Policy");

		expect(csp).toContain("connect-src 'self' https://api.onswitch.xyz");
		expect(csp).toContain("frame-ancestors 'none'");
		expect(csp).toContain("object-src 'none'");
	});

	it("excludes unsafe-eval from script-src in production", () => {
		process.env.NODE_ENV = "production";
		const response = applySecurityHeaders(new Response("ok"));
		const csp = response.headers.get("Content-Security-Policy");

		expect(csp).toContain("script-src 'self' 'unsafe-inline'");
		expect(csp).not.toContain("unsafe-eval");
	});

	it("allows unsafe-eval outside production for Vite dev tooling", () => {
		process.env.NODE_ENV = "development";
		const response = applySecurityHeaders(new Response("ok"));
		const csp = response.headers.get("Content-Security-Policy");

		expect(csp).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
	});

	it("returns the same response instance it was given", () => {
		const response = new Response("ok");
		expect(applySecurityHeaders(response)).toBe(response);
	});
});
