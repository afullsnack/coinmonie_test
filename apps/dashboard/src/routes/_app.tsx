import { createFileRoute } from '@tanstack/react-router'

import { AppShell } from '#/components/dashboard/app-shell'
import { requireSession } from '#/lib/session'

export const Route = createFileRoute('/_app')({
  beforeLoad: requireSession,
  component: AppShellRoute,
})

function AppShellRoute() {
  const { session } = Route.useRouteContext()
  return <AppShell session={session} />
}
