import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

console.log('Process typeof', typeof process, {process: process.env})

export const env = createEnv({
  /**
   * Server-only variables. Never import these into client code; accessing one
   * in the browser throws instead of leaking `undefined`.
   */
  server: {
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    SERVER_URL: z.url().optional(),

    /** libSQL URL: `file:./local.db` locally, `libsql://…` for Turso. */
    DATABASE_URL: z
      .string()
      .regex(/^(file:|libsql:|https?:|wss?:)/, 'Must be a libSQL URL')
      .default('file:./local.db'),
    DATABASE_AUTH_TOKEN: z.string().min(1).optional(),

    BETTER_AUTH_SECRET: z.string().min(12),
    BETTER_AUTH_URL: z.url(),
    /** Comma-separated extra origins allowed to call the auth API. */
    BETTER_AUTH_TRUSTED_ORIGINS: z
      .string()
      .optional()
      .transform((value) =>
        value
          ? value
              .split(',')
              .map((origin) => origin.trim())
              .filter(Boolean)
          : [],
      ),

    /** Plunk secret key (`sk_…`). When unset, emails are logged instead of sent. */
    PLUNK_SECRET_KEY: z.string().startsWith('sk_').optional(),
    PLUNK_API_URL: z.url().default('https://next-api.useplunk.com'),
    EMAIL_FROM: z.email().default('no-reply@coinmonie.com'),
		EMAIL_FROM_NAME: z.string().min(1).default('CoinMonie'),

		// R2 Bucket
		R2_ACCOUNT_ID: z.string().optional(),
		R2_ACCESS_KEY_ID: z.string().optional(),
		R2_SECRET_ACCESS_KEY: z.string().optional(),
		R2_BUCKET: z.string().optional(),
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: 'VITE_',

  client: {
		VITE_APP_TITLE: z.string().min(1).optional(),
    VITE_R2_PUBLIC_URL: z.string().optional(),
  },

  /**
   * Server code reads `process.env` (TanStack Start loads `.env*` files into
   * it); the client bundle only has Vite's `import.meta.env`.
   */
  runtimeEnv:
    typeof process === 'undefined'
      ? import.meta.env
      : { ...import.meta.env, ...process.env },

  isServer: typeof window === 'undefined',

  /**
   * Treat `FOO=` in a `.env` file as unset so defaults apply and optional
   * values are not validated as empty strings.
   */
  emptyStringAsUndefined: true,
})
