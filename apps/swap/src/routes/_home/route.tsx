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

  console.log(`Using router state to match home`, { matchHome })

  return (
    <Main className="min-h-screen bg-[#0a0f1a] flex flex-col">
      <Section className='p-1!'>
        <Container className='max-w-lg'>
     			<header className="flex items-center justify-between px-4 md:p-6">
    				<Link className="flex items-center gap-2" to='/'>
     					<div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
      						<span className="text-black font-bold text-sm">C</span>
     					</div>
     					<span className="text-white font-semibold text-lg hidden sm:block">
      						CoinMoney
     					</span>
    				</Link>
            <Button
              size="icon-lg"
              variant="outline"
              className="p-1"
              asChild
            >
              <Link to='/transactions'>
       					<Clock className="w-5 h-5 text-gray-400" />
              </Link>
    				</Button>
          </header>
      </Container>
    </Section>
    <Section className='p-0!'>
        <Container className={cn(
          'p-0! flex items-center justify-center',
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
