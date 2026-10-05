import { requireSession } from '#/lib/session'
import { Outlet, createFileRoute } from '@tanstack/react-router'

import { KybProvider } from '#/components/kyb/kyb-context'
import { Stepper } from '#/components/kyb/stepper'

export const Route = createFileRoute('/kyb')({
  beforeLoad: requireSession,
  head: () => ({ meta: [{ title: 'Business verification · CoinMonie' }] }),
  component: KybLayout,
})

function KybLayout() {
  return (
    <div className="min-h-dvh bg-[#1a1a1a] font-sans antialiased">
      <KybProvider>
        <Stepper />
        <main className="mx-auto w-[710px] max-w-[calc(100%-48px)] pt-[56px] pb-16">
          <Outlet />
        </main>
      </KybProvider>
    </div>
  )
}
