import { Container, Main, Section } from '#/components/craft'
import { Button } from '#/components/ui/button'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { Clock, Headphones } from 'lucide-react'

const SUPPORT_EMAIL = 'support@coinmonie.com'
const SUPPORT_MAILTO_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${SUPPORT_EMAIL}`

export const Route = createFileRoute('/_home')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Main className="min-h-screen flex flex-col bg-secondary selection:bg-accent selection:text-secondary">
      <Section className='p-0!'>
        <Container className='max-w-lg p-0!'>
     			<header className="flex items-center justify-between px-4">
    				<Link className="flex items-center gap-2" to='/'>
     					<img src='/coinmonie_full_logo_primary.png' className='object-contain h-12' />
    				</Link>
            <div className="flex items-center">
              <Button
                size="icon-lg"
                variant="ghost"
                className="hover:bg-secondary"
                asChild
              >
                <a href={SUPPORT_MAILTO_URL} target="_blank" rel="noopener noreferrer" aria-label="Contact support">
                  <Headphones className="size-6 text-accent" />
                </a>
              </Button>
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
            </div>
          </header>
      </Container>
    </Section>
    <Section className='p-0!'>
      <Container className='p-0! flex items-center justify-center max-w-lg'>
        <Outlet />
      </Container>
    </Section>
  </Main>
  )
}
