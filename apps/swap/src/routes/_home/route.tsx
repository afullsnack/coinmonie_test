import { Container, Main, Section } from '#/components/craft'
import { Button } from '#/components/ui/button'
import { InstallPrompt } from '#/components/install-prompt'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { History, Mail, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const SUPPORT_EMAIL = 'support@coinmonie.com'
const SUPPORT_MAILTO_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${SUPPORT_EMAIL}`

export const Route = createFileRoute('/_home')({
  component: RouteComponent,
})

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="size-9 md:size-11" />

  return (
    <Button
      size="icon"
      variant="ghost"
      className="hover:bg-secondary size-9 md:size-11"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="size-4 md:size-6 text-accent" />
      ) : (
        <Moon className="size-4 md:size-6 text-accent" />
      )}
    </Button>
  )
}

function Logo() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = !mounted || resolvedTheme === 'dark'

  return (
    <img
      src='/coinmonie_full_logo_rgb_white_transparent.png'
      className={`object-contain h-12 ${isDark ? '' : 'brightness-0'}`}
    />
  )
}

function RouteComponent() {
  return (
    <Main className="min-h-screen flex flex-col bg-secondary selection:bg-accent selection:text-secondary">
      <InstallPrompt />
      <Section className='p-0!'>
        <Container className='max-w-lg p-0!'>
     			<header className="flex items-center justify-between px-4">
    				<Link className="flex items-center gap-2" to='/'>
     					<Logo />
    				</Link>
            <div className="flex items-center">
              <ThemeToggle />
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-secondary size-9 md:size-11"
                asChild
              >
                <a href={SUPPORT_MAILTO_URL} target="_blank" rel="noopener noreferrer" aria-label="Contact support">
                  <Mail className="size-4 md:size-6 text-accent" />
                </a>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-secondary size-9 md:size-11"
                asChild
              >
                <Link to='/transactions'>
                  <History className="size-4 md:size-6 text-accent" />
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
