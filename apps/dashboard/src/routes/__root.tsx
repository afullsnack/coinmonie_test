import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { StepUpProvider } from '#/components/auth/step-up'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { useMediaQuery } from '#/hooks/use-media-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'CoinMonie | Business',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
	const isMobile = useMediaQuery("(max-width: 768px)")


	if (isMobile) {
		return (
			<html lang="en">
				<head>
					<HeadContent />
				</head>
				<body>
					<h2 className='mx-auto p-12 font-semibold text-xl text-balance text-center'>
						This dashboard is only viewable on a desktop or devices with screens above 768px width
					</h2>
				</body>
			</html>
		)
	}

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <StepUpProvider>{children}</StepUpProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
