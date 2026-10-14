type Template = { subject: string; body: string }

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)

function layout({ heading, intro, content, footnote }: { heading: string; intro: string; content: string; footnote: string }) {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#1a1a1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e6e6e6">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:448px;background:#232323;border-radius:20px;padding:32px">
          <tr><td>
            <p style="margin:0 0 24px;font-size:18px;font-weight:700;color:#fafafa">CoinMonie</p>
            <h1 style="margin:0 0 8px;font-size:22px;line-height:1.2;color:#fafafa">${heading}</h1>
            <p style="margin:0 0 24px;font-size:14px;line-height:1.5;color:#9a9a9a">${intro}</p>
            ${content}
            <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#6b6b6b">${footnote}</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`
}

function button(url: string, label: string) {
  return `<a href="${escape(url)}" style="display:block;text-align:center;background:#f2f2f2;color:#1a1a1a;text-decoration:none;font-size:14px;font-weight:600;border-radius:14px;padding:14px 0">${label}</a>`
}

export function verificationCodeEmail({ otp, minutes }: { otp: string; minutes: number }): Template {
  return {
    subject: `${otp} is your CoinMonie verification code`,
    body: layout({
      heading: 'Verify your email',
      intro: 'Enter this 6-digit code to finish creating your CoinMonie account.',
      content: `<p style="margin:0;text-align:center;font-size:32px;letter-spacing:10px;font-weight:700;color:#fafafa">${escape(otp)}</p>`,
      footnote: `The code expires in ${minutes} minutes. If you didn't create an account, you can ignore this email.`,
    }),
  }
}

export function confirmIdentityEmail({ otp, minutes }: { otp: string; minutes: number }): Template {
  return {
    subject: `${otp} is your CoinMonie confirmation code`,
    body: layout({
      heading: 'Confirm it’s you',
      intro: 'Enter this 6-digit code to approve the security change on your account.',
      content: `<p style="margin:0;text-align:center;font-size:32px;letter-spacing:10px;font-weight:700;color:#fafafa">${escape(otp)}</p>`,
      footnote: `The code expires in ${minutes} minutes. If you didn't request it, change your password.`,
    }),
  }
}

export function resetPasswordEmail({ url, name }: { url: string; name: string }): Template {
  return {
    subject: 'Reset your CoinMonie password',
    body: layout({
      heading: 'Reset your password',
      intro: `Hi ${escape(name)}, use the button below to create a new password.`,
      content: button(url, 'Create new password'),
      footnote: "This link expires in 1 hour. If you didn't request a reset, your password is unchanged.",
    }),
  }
}

export function resetPinEmail({ url, name }: { url: string; name: string }): Template {
  return {
    subject: 'Reset your CoinMonie PIN',
    body: layout({
      heading: 'Reset your PIN',
      intro: `Hi ${escape(name)}, use the button below to create a new 6-digit PIN.`,
      content: button(url, 'Create new PIN'),
      footnote: "This link expires in 1 hour. If you didn't request a reset, your PIN is unchanged.",
    }),
  }
}