import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit, getClientIp } from "./rate-limit";

describe("getClientIp", () => {
	it("prefers cf-connecting-ip since it cannot be spoofed by the client", () => {
		const request = new Request("https://example.com", {
			headers: {
				"cf-connecting-ip": "1.1.1.1",
				"x-forwarded-for": "2.2.2.2",
				"x-real-ip": "3.3.3.3",
			},
		});
		expect(getClientIp(request)).toBe("1.1.1.1");
	});

	it("falls back to the first entry of x-forwarded-for", () => {
		const request = new Request("https://example.com", {
			headers: { "x-forwarded-for": "2.2.2.2, 4.4.4.4" },
		});
		expect(getClientIp(request)).toBe("2.2.2.2");
	});

	it("falls back to x-real-ip when nothing else is present", () => {
		const request = new Request("https://example.com", {
			headers: { "x-real-ip": "3.3.3.3" },
		});
		expect(getClientIp(request)).toBe("3.3.3.3");
	});

	it('returns "unknown" when no IP header is present', () => {
		const request = new Request("https://example.com");
		expect(getClientIp(request)).toBe("unknown");
	});
});

describe("checkRateLimit", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	function requestFrom(ip: string) {
		return new Request("https://example.com", {
			headers: { "cf-connecting-ip": ip },
		});
	}

	it("allows requests under the limit", async () => {
		const request = requestFrom("10.0.0.1");
		for (let i = 0; i < 3; i++) {
			expect(await checkRateLimit(request, "test-scope-a", 3, 60_000)).toBe(
				false,
			);
		}
	});

	it("blocks once the limit is exceeded", async () => {
		const request = requestFrom("10.0.0.2");
		for (let i = 0; i < 3; i++) {
			await checkRateLimit(request, "test-scope-b", 3, 60_000);
		}
		expect(await checkRateLimit(request, "test-scope-b", 3, 60_000)).toBe(true);
	});

	it("resets the count after the window elapses", async () => {
		const request = requestFrom("10.0.0.3");
		for (let i = 0; i < 3; i++) {
			await checkRateLimit(request, "test-scope-c", 3, 60_000);
		}
		expect(await checkRateLimit(request, "test-scope-c", 3, 60_000)).toBe(true);

		vi.advanceTimersByTime(60_001);

		expect(await checkRateLimit(request, "test-scope-c", 3, 60_000)).toBe(
			false,
		);
	});

	it("tracks separate buckets per IP", async () => {
		const requestA = requestFrom("10.0.0.4");
		const requestB = requestFrom("10.0.0.5");

		for (let i = 0; i < 3; i++) {
			await checkRateLimit(requestA, "test-scope-d", 3, 60_000);
		}
		expect(await checkRateLimit(requestA, "test-scope-d", 3, 60_000)).toBe(
			true,
		);
		// a different IP under the same scope must not be affected
		expect(await checkRateLimit(requestB, "test-scope-d", 3, 60_000)).toBe(
			false,
		);
	});

	it("tracks separate buckets per scope for the same IP", async () => {
		const request = requestFrom("10.0.0.6");

		for (let i = 0; i < 3; i++) {
			await checkRateLimit(request, "test-scope-e1", 3, 60_000);
		}
		expect(await checkRateLimit(request, "test-scope-e1", 3, 60_000)).toBe(
			true,
		);
		// a different scope for the same IP must not be affected
		expect(await checkRateLimit(request, "test-scope-e2", 3, 60_000)).toBe(
			false,
		);
	});
});
