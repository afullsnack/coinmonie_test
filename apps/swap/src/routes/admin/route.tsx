import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { getAdminSession } from '#/server/admin-session.functions'
import { Container, Main, Section } from '#/components/craft'

const PUBLIC_PATHS = ['/admin/login']

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ location }) => {
    const { enabled, session } = await getAdminSession()

    if (!enabled) {
      throw redirect({ to: '/' })
    }

    if (!session && !PUBLIC_PATHS.includes(location.pathname)) {
      throw redirect({ to: '/admin/login' })
    }

    if (
      session &&
      (session.user as { mustChangePassword?: boolean }).mustChangePassword &&
      location.pathname !== '/admin/change-password'
    ) {
      throw redirect({ to: '/admin/change-password' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Main className="min-h-screen flex flex-col bg-secondary selection:bg-accent selection:text-secondary">
      <Section className="p-0!">
        <Container className="max-w-4xl p-0!">
          <header className="flex items-center justify-between px-4">
            <Link className="flex items-center gap-2" to="/admin">
              <img src="/coinmonie_full_logo_rgb_white_transparent.png" className="object-contain h-12" />
            </Link>
          </header>
        </Container>
      </Section>
      <Section className="p-0!">
        <Container className="p-0! max-w-4xl">
          <Outlet />
        </Container>
      </Section>
    </Main>
  )
}
