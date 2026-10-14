import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { HourglassIllustration } from '#/components/kyb/illustrations'
import { PrimaryButton } from '#/components/auth/primary-button'

export const Route = createFileRoute('/kyb/under-review')({
  component: UnderReview,
})

function UnderReview() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto w-[448px] max-w-full text-center">
      <HourglassIllustration className="mx-auto" />
      <h1 className="mt-[24px] text-[24px] leading-[1.1] font-bold tracking-[-0.01em] text-[#fafafa]">
        Verification under review
      </h1>
      <p className="mt-[10px] text-sm text-[#9a9a9a]">
        Thanks. Our compliance team is verifying your business. This usually
        <br />
        takes 1-2 business days, and we'll email you as soon as it's done.
      </p>
      <PrimaryButton
        type="button"
        onClick={() => navigate({ to: '/' })}
        className="mt-[36px] mx-auto"
      >
        Explore your dashboard
      </PrimaryButton>
    </div>
  )
}
