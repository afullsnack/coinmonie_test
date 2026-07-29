import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		SERVER_URL: z.string().url().optional(),
		SWITCH_API_KEY: z.string(),
		NODE_ENV: z.string(),
		FEATURE_FLAG_TRANSACTION_HISTORY: z
			.string()
			.transform((v) => v === "true")
			.default(false),
		FEATURE_FLAG_CURRENCIES: z
			.string()
			.default("NGN")
			.transform((v) => v.split(",").map((c) => c.trim().toUpperCase())),
		FEATURE_FLAG_ADMIN_DASHBOARD: z
			.string()
			.transform((v) => v === "true")
			.default(false),
		ADMIN_EMAIL: z.string().email().optional(),
		ADMIN_PASSWORD: z.string().min(8).optional(),
		FEATURE_FLAG_DEVELOPER_FEE: z
			.string()
			.transform((v) => v === "true")
			.default(false),
		DEVELOPER_FEE_PERCENT: z
			.string()
			.default("0")
			.transform((v) => Number(v)),
		FEATURE_FLAG_RATE_LIMIT: z
			.string()
			.default("true")
			.transform((v) => v !== "false"),
	},

	/**
	 * The prefix that client-side variables must have. This is enforced both at
	 * a type-level and at runtime.
	 */
	clientPrefix: "VITE_",

	client: {
		VITE_APP_TITLE: z.string().min(1).optional(),
	},

	/**
	 * What object holds the environment variables at runtime. This is usually
	 * `process.env` or `import.meta.env`.
	 */
	runtimeEnv: process.env,

	/**
	 * By default, this library will feed the environment variables directly to
	 * the Zod validator.
	 *
	 * This means that if you have an empty string for a value that is supposed
	 * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
	 * it as a type mismatch violation. Additionally, if you have an empty string
	 * for a value that is supposed to be a string with a default value (e.g.
	 * `DOMAIN=` in an ".env" file), the default value will never be applied.
	 *
	 * In order to solve these issues, we recommend that all new projects
	 * explicitly specify this option as true.
	 */
	emptyStringAsUndefined: true,
});
