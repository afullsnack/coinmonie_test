import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { joinWaitlistMutationOptions } from '#/lib/api-client'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const WaitlistSignup = () => {
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const join = useMutation(joinWaitlistMutationOptions)

  const isValidEmail = EMAIL_PATTERN.test(email.trim())
  const showEmailError = touched && email.length > 0 && !isValidEmail

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!isValidEmail) return
    join.mutate({ email: email.trim() })
  }

  if (join.isSuccess) {
    return (
      <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        <CheckCircle2 className="size-4 text-accent" />
        You're on the list — we'll keep you posted.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-semibold text-foreground">Stay in the loop</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Leave your email to receive exclusive payout rate alerts and product updates.
      </p>

      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={showEmailError}
          className="rounded-xl"
        />
        <Button
          type="submit"
          disabled={join.isPending}
          className="rounded-xl bg-accent text-accent-foreground shrink-0"
        >
          {join.isPending ? 'Joining...' : 'Join waitlist'}
        </Button>
      </div>
      {showEmailError && (
        <p className="mt-1.5 text-xs text-destructive">Enter a valid email address.</p>
      )}
    </form>
  )
}

export default WaitlistSignup
