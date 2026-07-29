import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "#/db";
import { env } from "#/env";
import * as schema from "#/db/schema";

export const auth = betterAuth({
	secret: env.BETTER_AUTH_SECRET,
	...(env.SERVER_URL ? { baseURL: env.SERVER_URL, trustedOrigins: [env.SERVER_URL] } : {}),
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	emailAndPassword: {
		enabled: true,
		disableSignUp: true,
	},
	rateLimit: {
		enabled: true,
		window: 60,
		max: 10,
	},
	user: {
		additionalFields: {
			mustChangePassword: {
				type: "boolean",
				required: false,
				defaultValue: false,
				input: false,
			},
		},
	},
	plugins: [tanstackStartCookies()],
});
