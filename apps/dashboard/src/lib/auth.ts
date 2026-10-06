import { passkey } from '@better-auth/passkey'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { emailOTP, organization, twoFactor } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { asc, eq } from 'drizzle-orm'

import { db } from '#/db'
import * as schema from '#/db/schema'
import { env } from '#/env'
import { pin } from '#/lib/auth-plugins/pin'
import {
  confirmIdentityEmail,
  resetPasswordEmail,
  resetPinEmail,
  sendEmail,
  verificationCodeEmail,
} from '#/lib/email'

const APP_NAME = 'CoinMonie'
const OTP_EXPIRES_IN = 5 * 60
const appUrl = new URL(env.BETTER_AUTH_URL)

export const auth = betterAuth({
  appName: APP_NAME,
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [appUrl.origin, ...env.BETTER_AUTH_TRUSTED_ORIGINS],
  database: drizzleAdapter(db, { provider: 'sqlite', schema }),
  // Email-OTP is only used for verification and "confirm it's you" codes; its
  // passwordless sign-in and reset routes would bypass the password + 2FA.
  disabledPaths: [
    '/sign-in/email-otp',
    '/forget-password/email-otp',
    '/email-otp/request-password-reset',
    '/email-otp/reset-password',
    '/email-otp/request-email-change',
    '/email-otp/change-email',
  ],

  user: {
    additionalFields: {
      firstName: { type: 'string', required: false },
      lastName: { type: 'string', required: false },
    },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({ to: user.email, ...resetPasswordEmail({ url, name: user.name }) })
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },

  rateLimit: { enabled: true, storage: 'database' },

  databaseHooks: {
    user: {
      create: {
        // Every account gets its own business workspace (the "Team").
        after: async (user) => {
          await auth.api.createOrganization({
            body: {
              name: `${user.name.split(' ')[0] || 'My'}'s business`,
              slug: `biz-${user.id.toLowerCase()}`,
              userId: user.id,
            },
          })
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const [membership] = await db
            .select({ organizationId: schema.member.organizationId })
            .from(schema.member)
            .where(eq(schema.member.userId, session.userId))
            .orderBy(asc(schema.member.createdAt))
            .limit(1)
          return { data: { ...session, activeOrganizationId: membership?.organizationId ?? null } }
        },
      },
    },
  },

  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: OTP_EXPIRES_IN,
      storeOTP: 'hashed',
      overrideDefaultEmailVerification: true,
      // Users are created through password sign-up, never by an OTP request.
      disableSignUp: true,
      sendVerificationOTP: async ({ email, otp, type }) => {
        const minutes = OTP_EXPIRES_IN / 60
        if (type === 'email-verification') {
					await sendEmail({ to: email, ...verificationCodeEmail({ otp, minutes }) })
        } else if (type === 'sign-in') {
          // Used as a "Confirm it's you" code before adding a passkey.
          await sendEmail({ to: email, ...confirmIdentityEmail({ otp, minutes }) })
        }
      },
    }),
    twoFactor({
      issuer: APP_NAME,
      totpOptions: { digits: 6, period: 30 },
    }),
    organization({ creatorRole: 'owner' }),
    passkey({
      rpID: appUrl.hostname,
      rpName: APP_NAME,
      origin: appUrl.origin,
    }),
    pin({
      sendResetPin: async ({ user, url }) => {
        await sendEmail({ to: user.email, ...resetPinEmail({ url, name: user.name }) })
      },
    }),
    // Must stay last so it can forward Set-Cookie headers from the plugins above.
    tanstackStartCookies(),
  ],
})

export type Session = typeof auth.$Infer.Session
