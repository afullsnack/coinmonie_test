import { Separator } from '#/components/ui/separator'
import { cn } from 'cn'

/**
 * Full-viewport dark shell shared by the auth screens. Content is a centered
 * 448px column anchored to the top; the optional footer is pinned to the
 * bottom with a page-wide divider (see the signup design).
 */
export function AuthShell({
  footer,
  children,
  className,
}: {
  footer?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#1a1a1a] font-sans antialiased">
      <main
        className={cn(
          'mx-auto w-[448px] max-w-[calc(100%-48px)] pt-[118px] pb-16',
          className,
        )}
      >
        {children}
      </main>
      {footer ? (
        <footer className="mt-auto pb-[26px]">
          <Separator className="mx-auto bg-[#2b2b2b] data-horizontal:w-[calc(100%-200px)] max-sm:data-horizontal:w-[calc(100%-48px)]" />
          {footer}
        </footer>
      ) : null}
    </div>
  )
}
