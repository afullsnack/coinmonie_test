import { cn } from 'cn'

/**
 * Flat SVG approximations of the KYB illustrations: classical bank, coral
 * person badge, lavender folder, magnifier, hourglass, red error circle and
 * red trash.
 */
export function BankIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 60"
      fill="none"
      aria-hidden="true"
      className={cn('h-[46px] w-auto', className)}
    >
      <path d="M6 18 L32 4 L58 18 L58 22 L6 22 Z" fill="#c9c9c9" />
      <path d="M6 18 L32 4 L58 18 L54 18 L32 7 L10 18 Z" fill="#8a8a8a" />
      <rect x="9" y="26" width="7" height="20" fill="#b5b5b5" />
      <rect x="21" y="26" width="7" height="20" fill="#cfcfcf" />
      <rect x="36" y="26" width="7" height="20" fill="#b5b5b5" />
      <rect x="48" y="26" width="7" height="20" fill="#cfcfcf" />
      <rect x="4" y="48" width="56" height="6" rx="2" fill="#8a8a8a" />
      <rect x="6" y="54" width="52" height="4" rx="2" fill="#6b6b6b" />
    </svg>
  )
}

export function PersonIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden="true"
      className={cn('size-[46px]', className)}
    >
      <circle cx="28" cy="28" r="28" fill="#f4756b" />
      <circle cx="28" cy="23" r="7.5" fill="#ffffff" />
      <path
        d="M14 44 C15 34.5 21 30.5 28 30.5 C35 30.5 41 34.5 42 44 C38.5 48.5 33 51 28 51 C23 51 17.5 48.5 14 44 Z"
        fill="#ffffff"
      />
      <path
        d="M14 44 C15 34.5 21 30.5 28 30.5 C31 30.5 33.8 31.3 36.2 32.8 C30 33.8 22 36.5 19 44.5 C17 44.6 15.4 44.5 14 44 Z"
        fill="#e5e0e6"
        opacity="0.55"
      />
    </svg>
  )
}

export function FolderIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 52"
      fill="none"
      aria-hidden="true"
      className={cn('h-[46px] w-auto', className)}
    >
      <path
        d="M8 12 C8 9.8 9.8 8 12 8 L22 8 L26 12 L44 12 C46.2 12 48 13.8 48 16 L48 20 L8 20 Z"
        fill="#a49ce8"
      />
      <rect x="12" y="14" width="40" height="30" rx="3" fill="#cfc9f5" />
      <path
        d="M6 18 C6 15.8 7.8 14 10 14 L46 14 C48.2 14 50 15.8 50 18 L46 46 L10 46 Z"
        fill="#b7b0ee"
      />
      <path
        d="M6 18 C6 15.8 7.8 14 10 14 L14 14 L10 46 L6 46 Z"
        fill="#8f86e0"
      />
      <rect
        x="22"
        y="28"
        width="14"
        height="3"
        rx="1.5"
        fill="#8f86e0"
        opacity="0.7"
      />
    </svg>
  )
}

export function MagnifierIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 56"
      fill="none"
      aria-hidden="true"
      className={cn('h-[46px] w-auto', className)}
    >
      <rect
        x="2"
        y="27"
        width="22"
        height="5"
        rx="2.5"
        transform="rotate(-28 2 27)"
        fill="#5d7d78"
      />
      <circle cx="46" cy="24" r="20" fill="#17343a" />
      <circle cx="46" cy="24" r="20" stroke="#2c555c" strokeWidth="3" />
      <path
        d="M34 16 C38 11 44 9 50 10"
        stroke="#3d6a70"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function HourglassIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 56 80"
      fill="none"
      aria-hidden="true"
      className={cn('h-[76px] w-auto', className)}
    >
      <path
        d="M8 6 L48 6 L48 16 C48 26 36 32 32 40 C36 48 48 54 48 64 L48 74 L8 74 L8 64 C8 54 20 48 24 40 C20 32 8 26 8 16 Z"
        fill="#8fd8cf"
        opacity="0.5"
      />
      <path
        d="M12 8 L44 8 L44 15 C44 24 34 29 30 37 L26 37 C22 29 12 24 12 15 Z"
        fill="#c4ece7"
      />
      <path
        d="M12 66 C12 57 22 51 26 43 L30 43 C34 51 44 57 44 66 L44 72 L12 72 Z"
        fill="#c4ece7"
      />
      <path
        d="M20 62 C24 56 27 51 28 46 L28 43 L30 43 C31 51 36 57 40 62 Z"
        fill="#6f5bd8"
      />
      <path
        d="M24 22 C26 27 28 31 28 36 L28 40 L26 40 C24 33 20 28 15 24 Z"
        fill="#6f5bd8"
      />
      <rect x="6" y="4" width="44" height="5" rx="2.5" fill="#4fc3b5" />
      <rect x="6" y="72" width="44" height="5" rx="2.5" fill="#4fc3b5" />
    </svg>
  )
}

export function ErrorCircleIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={cn('size-[56px]', className)}
    >
      <circle cx="32" cy="32" r="32" fill="#f4473c" />
      <path
        d="M24 24 L40 40 M40 24 L24 40"
        stroke="#2a0d0b"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function TrashIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 56"
      fill="none"
      aria-hidden="true"
      className={cn('h-[48px] w-auto', className)}
    >
      <rect x="10" y="14" width="28" height="38" rx="7" fill="#f4473c" />
      <rect x="6" y="6" width="36" height="7" rx="3.5" fill="#e2352b" />
      <rect x="19" y="2" width="10" height="6" rx="3" fill="#e2352b" />
      <path
        d="M14 4 L34 4"
        stroke="#f4473c"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
