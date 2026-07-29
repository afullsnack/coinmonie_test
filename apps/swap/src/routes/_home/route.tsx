import { Container, Main, Section } from '#/components/craft'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { Clock } from 'lucide-react'

export const Route = createFileRoute('/_home')({
  component: RouteComponent,
})

function RouteComponent() {
  const matchHome = useRouterState({ select: (s) => s.matches.some((m) => m.routeId === "/_home/") })

  return (
    <Main className="min-h-screen flex flex-col bg-secondary selection:bg-accent selection:text-secondary">
      <Section className='p-0!'>
        <Container className='max-w-lg p-0!'>
     			<header className="flex items-center justify-between px-4">
    				<Link className="flex items-center gap-2" to='/'>
     					<img src='/coinmonie_full_logo_primary.png' className='object-contain h-12' />
    				</Link>
            <Button
              size="icon-lg"
              variant="ghost"
              className="hover:bg-secondary"
              asChild
            >
              <Link to='/transactions'>
       					<Clock className="size-6 text-accent" />
              </Link>
    				</Button>
          </header>
      </Container>
    </Section>
    <Section className='p-0!'>
      <Container className={cn(
        'p-0! flex items-center justify-center max-w-6xl',
        {
          "max-w-lg": matchHome
        }
      )}>
        <Outlet />
      </Container>
    </Section>
  </Main>
  )
}
