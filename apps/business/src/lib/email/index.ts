import { env } from '#/env'
import { sendWithPlunk } from './plunk'

export * from './templates'

type Email = { to: string; subject: string; body: string; from?: string | { email: string; name?: string }; idempotencyKey?: string }

/**
 * Delivers auth emails through Plunk. Without `PLUNK_SECRET_KEY` outside
 * production, the email is printed to the server console so local sign-up
 * still works offline.
 */
export async function sendEmail(email: Email) {
  if (!env.PLUNK_SECRET_KEY) {
    if (env.NODE_ENV === 'production') {
      throw new Error('PLUNK_SECRET_KEY is required to send email in production')
    }
    const text = email.body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    console.info(`\n[email] to=${email.to} subject="${email.subject}"\n${text}\n`)
    return
  }
	await sendWithPlunk(email)
		.catch(console.log)
}
