import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/payouts/groups')({
  component: Outlet,
})
