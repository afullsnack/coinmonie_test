import type { AuthContext, BetterAuthPlugin } from 'better-auth'
import { APIError, createAuthEndpoint, sessionMiddleware } from 'better-auth/api'
import { setSessionCookie } from 'better-auth/cookies'
import { generateRandomString, hashPassword, verifyPassword } from 'better-auth/crypto'
import { z } from 'zod'

export const PIN_LENGTH = 6
export const PIN_MAX_ATTEMPTS = 5

const RESET_PREFIX = 'pin-reset:'
const RESET_TTL_SECONDS = 60 * 60
const TWO_FACTOR_COOKIE = 'two_factor'
const TWO_FACTOR_TTL_SECONDS = 600

export const PIN_ERROR_CODES = {
  INVALID_PIN: { code: 'INVALID_PIN', message: 'The PIN entered is wrong' },
  PIN_NOT_SET: { code: 'PIN_NOT_SET', message: 'Create a PIN first' },
  PIN_LOCKED: { code: 'PIN_LOCKED', message: 'Too many wrong attempts. Reset your PIN to continue' },
  PIN_LOGIN_DISABLED: { code: 'PIN_LOGIN_DISABLED', message: 'PIN sign in is not enabled for this account' },
  INVALID_TOKEN: { code: 'INVALID_TOKEN', message: 'This reset link is invalid or has expired' },
} as const

const pinField = z.string().regex(/^\d{6}$/, 'PIN must be 6 digits')

type PinUser = {
  id: string
  email: string
  name: string
  emailVerified: boolean
  twoFactorEnabled?: boolean | null
  pinHash?: string | null
  pinLoginEnabled?: boolean | null
  pinFailedAttempts?: number | null
}

export type PinOptions = {
  /** Sends the reset link; `url` already contains the token. */
  sendResetPin: (data: { user: { id: string; email: string; name: string }; url: string }) => Promise<void>
  /** App page that reads `?token=` and calls `pin.reset`. */
  resetPinPath?: string
}

const fail = (status: 'BAD_REQUEST' | 'FORBIDDEN' | 'UNAUTHORIZED', error: { code: string; message: string }) =>
  new APIError(status, { code: error.code, message: error.message })

/**
 * Account PIN: a 6-digit secret used to confirm sensitive actions (step-up)
 * and, when the user opts in, as a quick sign-in on returning devices.
 */
export const pin = (options: PinOptions) => {
  const resetPath = options.resetPinPath ?? '/reset-pin'

  return {
    id: 'pin',
    schema: {
      user: {
        fields: {
          pinHash: { type: 'string', required: false, returned: false, input: false },
          pinLoginEnabled: { type: 'boolean', required: false, defaultValue: false, input: false },
          pinFailedAttempts: { type: 'number', required: false, defaultValue: 0, returned: false, input: false },
        },
      },
    },
    endpoints: {
      pinStatus: createAuthEndpoint(
        '/pin/status',
        { method: 'GET', use: [sessionMiddleware] },
        async (ctx) => {
          const user = await findUser(ctx, ctx.context.session.user.id)
          return ctx.json({
            hasPin: Boolean(user?.pinHash),
            loginEnabled: Boolean(user?.pinHash && user.pinLoginEnabled),
            locked: (user?.pinFailedAttempts ?? 0) >= PIN_MAX_ATTEMPTS,
          })
        },
      ),

      setPin: createAuthEndpoint(
        '/pin/set',
        {
          method: 'POST',
          use: [sessionMiddleware],
          body: z.object({
            pin: pinField,
            /** Required when replacing an existing PIN. */
            currentPin: pinField.optional(),
            enableLogin: z.boolean().optional(),
          }),
        },
        async (ctx) => {
          const user = await findUser(ctx, ctx.context.session.user.id)
          if (!user) throw fail('UNAUTHORIZED', PIN_ERROR_CODES.PIN_NOT_SET)
          if (user.pinHash) {
            if (!ctx.body.currentPin) throw fail('BAD_REQUEST', PIN_ERROR_CODES.INVALID_PIN)
            await assertPin(ctx, user, ctx.body.currentPin)
          }
          await updateUser(ctx, user.id, {
            pinHash: await hashPassword(ctx.body.pin),
            pinFailedAttempts: 0,
            ...(ctx.body.enableLogin === undefined ? {} : { pinLoginEnabled: ctx.body.enableLogin }),
          })
          return ctx.json({ status: true })
        },
      ),

      verifyPin: createAuthEndpoint(
        '/pin/verify',
        { method: 'POST', use: [sessionMiddleware], body: z.object({ pin: pinField }) },
        async (ctx) => {
          const user = await findUser(ctx, ctx.context.session.user.id)
          if (!user?.pinHash) throw fail('BAD_REQUEST', PIN_ERROR_CODES.PIN_NOT_SET)
          await assertPin(ctx, user, ctx.body.pin)
          return ctx.json({ valid: true })
        },
      ),

      setPinLogin: createAuthEndpoint(
        '/pin/login',
        { method: 'POST', use: [sessionMiddleware], body: z.object({ enabled: z.boolean() }) },
        async (ctx) => {
          const user = await findUser(ctx, ctx.context.session.user.id)
          if (ctx.body.enabled && !user?.pinHash) throw fail('BAD_REQUEST', PIN_ERROR_CODES.PIN_NOT_SET)
          await updateUser(ctx, ctx.context.session.user.id, { pinLoginEnabled: ctx.body.enabled })
          return ctx.json({ status: true })
        },
      ),

      requestPinReset: createAuthEndpoint(
        '/pin/request-reset',
        { method: 'POST', body: z.object({ email: z.email() }) },
        async (ctx) => {
          const user = await findUserByEmail(ctx, ctx.body.email)
          // Same response either way so the endpoint can't enumerate accounts.
          if (user) {
            const token = generateRandomString(32, 'a-z', 'A-Z', '0-9')
            await ctx.context.internalAdapter.createVerificationValue({
              identifier: `${RESET_PREFIX}${token}`,
              value: user.id,
              expiresAt: new Date(Date.now() + RESET_TTL_SECONDS * 1000),
            })
            const url = new URL(resetPath, ctx.context.baseURL.replace(/\/api\/auth\/?$/, ''))
            url.searchParams.set('token', token)
            await ctx.context.runInBackgroundOrAwait(
              options.sendResetPin({ user: { id: user.id, email: user.email, name: user.name }, url: url.toString() }),
            )
          }
          return ctx.json({ status: true })
        },
      ),

      resetPin: createAuthEndpoint(
        '/pin/reset',
        { method: 'POST', body: z.object({ token: z.string().min(1), pin: pinField }) },
        async (ctx) => {
          const identifier = `${RESET_PREFIX}${ctx.body.token}`
          const record = await ctx.context.internalAdapter.findVerificationValue(identifier)
          if (!record || record.expiresAt < new Date()) throw fail('BAD_REQUEST', PIN_ERROR_CODES.INVALID_TOKEN)
          await ctx.context.internalAdapter.deleteVerificationByIdentifier(identifier)
          await updateUser(ctx, record.value, {
            pinHash: await hashPassword(ctx.body.pin),
            pinFailedAttempts: 0,
          })
          return ctx.json({ status: true })
        },
      ),

      signInPin: createAuthEndpoint(
        '/sign-in/pin',
        {
          method: 'POST',
          body: z.object({ email: z.email(), pin: pinField, rememberMe: z.boolean().optional() }),
        },
        async (ctx) => {
          const user = await findUserByEmail(ctx, ctx.body.email)
          if (!user?.pinHash || !user.pinLoginEnabled) throw fail('FORBIDDEN', PIN_ERROR_CODES.PIN_LOGIN_DISABLED)
          if (!user.emailVerified) throw fail('FORBIDDEN', { code: 'EMAIL_NOT_VERIFIED', message: 'Email not verified' })
          await assertPin(ctx, user, ctx.body.pin)

          if (user.twoFactorEnabled) {
            // Hand off to the two-factor plugin's challenge, exactly like a
            // password sign-in would.
            const cookie = ctx.context.createAuthCookie(TWO_FACTOR_COOKIE, { maxAge: TWO_FACTOR_TTL_SECONDS })
            const identifier = `2fa-${generateRandomString(20)}`
            const expiresAt = new Date(Date.now() + TWO_FACTOR_TTL_SECONDS * 1000)
            await ctx.context.internalAdapter.createVerificationValue({ identifier, value: user.id, expiresAt })
            await ctx.context.internalAdapter.createVerificationValue({
              identifier: `2fa-attempts-${identifier}`,
              value: '0',
              expiresAt,
            })
            await ctx.setSignedCookie(cookie.name, identifier, ctx.context.secret, cookie.attributes)
            return ctx.json({ twoFactorRedirect: true as const, twoFactorMethods: ['totp'] })
          }

          const session = await ctx.context.internalAdapter.createSession(user.id, ctx.body.rememberMe === false)
          const fullUser = await ctx.context.internalAdapter.findUserById(user.id)
          if (!fullUser) throw fail('UNAUTHORIZED', PIN_ERROR_CODES.PIN_LOGIN_DISABLED)
          await setSessionCookie(ctx, { session, user: fullUser }, ctx.body.rememberMe === false)
          return ctx.json({ twoFactorRedirect: false as const, token: session.token })
        },
      ),
    },
    rateLimit: [
      { pathMatcher: (path) => path === '/sign-in/pin', window: 60, max: 5 },
      { pathMatcher: (path) => path === '/pin/verify', window: 60, max: 10 },
      { pathMatcher: (path) => path === '/pin/request-reset', window: 60, max: 3 },
    ],
    $ERROR_CODES: PIN_ERROR_CODES,
  } satisfies BetterAuthPlugin
}

type Ctx = { context: AuthContext }

async function findUser(ctx: Ctx, id: string) {
  return ctx.context.adapter.findOne<PinUser>({ model: 'user', where: [{ field: 'id', value: id }] })
}

async function findUserByEmail(ctx: Ctx, email: string) {
  return ctx.context.adapter.findOne<PinUser>({
    model: 'user',
    where: [{ field: 'email', value: email.toLowerCase() }],
  })
}

async function updateUser(ctx: Ctx, id: string, data: Partial<PinUser>) {
  await ctx.context.adapter.update({ model: 'user', where: [{ field: 'id', value: id }], update: data })
}

/** Checks the PIN and enforces the attempt lockout. */
async function assertPin(ctx: Ctx, user: PinUser, candidate: string) {
  const attempts = user.pinFailedAttempts ?? 0
  if (attempts >= PIN_MAX_ATTEMPTS) throw fail('FORBIDDEN', PIN_ERROR_CODES.PIN_LOCKED)
  if (!user.pinHash) throw fail('BAD_REQUEST', PIN_ERROR_CODES.PIN_NOT_SET)

  if (await verifyPassword({ hash: user.pinHash, password: candidate })) {
    if (attempts > 0) await updateUser(ctx, user.id, { pinFailedAttempts: 0 })
    return
  }
  const next = attempts + 1
  await updateUser(ctx, user.id, { pinFailedAttempts: next })
  throw next >= PIN_MAX_ATTEMPTS
    ? fail('FORBIDDEN', PIN_ERROR_CODES.PIN_LOCKED)
    : fail('BAD_REQUEST', PIN_ERROR_CODES.INVALID_PIN)
}
