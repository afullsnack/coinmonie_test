import { describe, expect, it } from "vitest";
import { isMaskedName } from "./offer.functions";

describe("isMaskedName", () => {
	it("treats a name containing an asterisk as masked", () => {
		expect(isMaskedName("J*** D**")).toBe(true);
		expect(isMaskedName("*")).toBe(true);
	});

	it("treats a plain name as not masked", () => {
		expect(isMaskedName("Jane Doe")).toBe(false);
	});

	it("treats an undefined name as not masked", () => {
		expect(isMaskedName(undefined)).toBe(false);
	});

	it("treats an empty string as not masked", () => {
		expect(isMaskedName("")).toBe(false);
	});
});
