import { describe, expect, it } from "vitest";
import { getExplorerUrl } from "./explorer";

describe("getExplorerUrl", () => {
	it("builds a block explorer link for a known network", () => {
		expect(getExplorerUrl("bsc:usdt", "0xabc123")).toBe(
			"https://bscscan.com/tx/0xabc123",
		);
	});

	it("builds a link for gnosis", () => {
		expect(getExplorerUrl("gnosis:usdc", "0xdef456")).toBe(
			"https://gnosisscan.io/tx/0xdef456",
		);
	});

	it("is case-insensitive on the network prefix", () => {
		expect(getExplorerUrl("BSC:usdt", "0xabc123")).toBe(
			"https://bscscan.com/tx/0xabc123",
		);
	});

	it("returns null when there is no transaction hash", () => {
		expect(getExplorerUrl("bsc:usdt", null)).toBeNull();
		expect(getExplorerUrl("bsc:usdt", undefined)).toBeNull();
		expect(getExplorerUrl("bsc:usdt", "")).toBeNull();
	});

	it("returns null for an unknown network", () => {
		expect(getExplorerUrl("made-up-chain:usdt", "0xabc123")).toBeNull();
	});

	it("returns null when asset is missing or has no network prefix", () => {
		expect(getExplorerUrl(null, "0xabc123")).toBeNull();
		expect(getExplorerUrl(undefined, "0xabc123")).toBeNull();
		expect(getExplorerUrl("", "0xabc123")).toBeNull();
	});

	it("handles tron and solana explorer URL shapes", () => {
		expect(getExplorerUrl("tron:usdt", "abc123")).toBe(
			"https://tronscan.org/#/transaction/abc123",
		);
		expect(getExplorerUrl("solana:usdc", "abc123")).toBe(
			"https://solscan.io/tx/abc123",
		);
	});
});
