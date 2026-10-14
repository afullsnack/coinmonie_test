import { useRouterState } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import { cn } from 'cn'

const STEPS = [
  { path: '/kyb/business-details', label: 'Business details' },
  { path: '/kyb/directors-and-ubos', label: 'Directors & UBOs' },
  { path: '/kyb/upload-documents', label: 'Documents' },
  { path: '/kyb/review-and-submit', label: 'Review & submit' },
]

/**
 * The 4-step KYB header: completed steps show a filled check circle with a
 * dimmed label, the current step a bright ring with a white label.
 */
export function Stepper() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const activeIndex =
    pathname === '/kyb/under-review'
      ? STEPS.length
      : STEPS.findIndex((step) => pathname.startsWith(step.path))

  return (
    <header className="border-b border-[#2b2b2b]">
      <nav aria-label="KYB steps" className="grid grid-cols-4 px-10 py-[21px]">
        {STEPS.map((step, index) => {
          const completed = index < activeIndex
          const current = index === activeIndex
          return (
            <div key={step.path} className="flex items-center gap-[10px]">
              <span
                aria-current={current ? 'step' : undefined}
                className={cn(
                  'flex size-[18px] items-center justify-center rounded-full border',
                  completed && 'border-transparent bg-[#3a3a3a] text-white',
                  current && 'border-[#e6e6e6]',
                  !completed && !current && 'border-[#4a4a4a]',
                )}
              >
                {completed ? <Check className="size-[10px] stroke-3" /> : null}
              </span>
              <span
                className={cn(
                  'text-[15px] font-medium',
                  current ? 'text-[#f5f5f5]' : 'text-[#9a9a9a]',
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </nav>
    </header>
  )
}
