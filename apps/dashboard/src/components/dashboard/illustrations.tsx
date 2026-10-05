import { cn } from 'cn'

/**
 * Flat SVG approximations of the CoinMonie illustrations used across the
 * dashboard and payout screens.
 */

/** White "coinmonie" wordmark for the sidebar. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 148 30"
      fill="none"
      aria-hidden="true"
      className={cn('h-[26px] w-auto', className)}
    >
      <path
        d="M20 8 C17 3.5 11 1.5 6.5 4 C1.5 6.8 0 13 2.8 18 C5.6 23 12 24.8 17 22.2 C19.4 21 21.2 18.8 22 16.4"
        stroke="#ffffff"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <circle cx="20" cy="9" r="4.5" fill="#ffffff" />
      <text
        x="28"
        y="22.5"
        fill="#ffffff"
        fontSize="21"
        fontWeight="700"
        fontFamily="Manrope, sans-serif"
        letterSpacing="-0.8"
      >
        oinmonie
      </text>
    </svg>
  )
}

/** Light-blue bank for the "Add a bank account" banner. */
export function BankBannerIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 64"
      fill="none"
      aria-hidden="true"
      className={cn('h-[52px] w-auto', className)}
    >
      <path d="M8 20 L36 6 L64 20 L64 25 L8 25 Z" fill="#b9cbf7" />
      <path d="M8 20 L36 6 L64 20 L58 20 L36 10 L14 20 Z" fill="#8fadf3" />
      <rect x="12" y="29" width="8" height="22" rx="1.5" fill="#a9c0f5" />
      <rect x="26" y="29" width="8" height="22" rx="1.5" fill="#cdd9fa" />
      <rect x="40" y="29" width="8" height="22" rx="1.5" fill="#a9c0f5" />
      <rect x="54" y="29" width="8" height="22" rx="1.5" fill="#cdd9fa" />
      <rect x="6" y="53" width="60" height="7" rx="3" fill="#8fadf3" />
      <rect x="9" y="60" width="54" height="4" rx="2" fill="#6f8ff0" />
    </svg>
  )
}

/** Open book for the empty recent-activity state. */
export function BookIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 64"
      fill="none"
      aria-hidden="true"
      className={cn('h-[56px] w-auto', className)}
    >
      <path
        d="M60 14 C48 6 30 4 12 10 L14 48 C30 42 48 44 60 52 Z"
        fill="#efe3c2"
      />
      <path
        d="M60 14 C72 6 90 4 108 10 L106 48 C90 42 72 44 60 52 Z"
        fill="#f7edd6"
      />
      <path d="M60 14 L60 52" stroke="#d9c8a0" strokeWidth="2" />
      <path
        d="M20 18 C34 14 46 16 54 22"
        stroke="#d9c8a0"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M100 18 C86 14 74 16 66 22"
        stroke="#d9c8a0"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6 12 C20 4 44 2 60 12 C76 2 100 4 114 12 L112 50 C98 44 76 44 60 52 C44 44 22 44 8 50 Z"
        stroke="#c9b285"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  )
}

/** Tilted bell for the empty notifications state. */
export function BellIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 88 72"
      fill="none"
      aria-hidden="true"
      className={cn('h-[56px] w-auto', className)}
    >
      <g transform="rotate(12 44 36)">
        <path
          d="M44 10 C32 10 24 20 24 32 L24 46 L18 56 L70 56 L64 46 L64 32 C64 20 56 10 44 10 Z"
          fill="#d7d7db"
        />
        <path
          d="M44 10 C38 10 32 14 30 22 L30 46 L26 52 L62 52 L58 46 L58 22 C56 14 50 10 44 10 Z"
          fill="#c4c4c9"
        />
        <circle cx="44" cy="62" r="7" fill="#a9a9af" />
        <rect x="40" y="4" width="8" height="8" rx="4" fill="#d7d7db" />
      </g>
      <path
        d="M8 26 C12 22 16 20 21 19"
        stroke="#9a9aa2"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M6 38 C10 36 14 35 18 34"
        stroke="#b5b5bd"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Floating orbs for the empty payout-group state. */
export function OrbsIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 72"
      fill="none"
      aria-hidden="true"
      className={cn('h-[56px] w-auto', className)}
    >
      <path d="M14 22 L84 8 L86 14 L16 28 Z" fill="#e2548b" />
      <path d="M16 40 L82 30 L84 36 L18 46 Z" fill="#d63a6e" />
      <circle cx="38" cy="18" r="9" fill="#efe6d8" />
      <circle cx="58" cy="28" r="11" fill="#4c55d8" />
      <circle cx="48" cy="52" r="15" fill="#8f86e0" />
      <path
        d="M36 62 C42 58 52 57 60 60"
        stroke="#6f66c9"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Pink key with purple head for the 2FA modal. */
export function KeyIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 88 56"
      fill="none"
      aria-hidden="true"
      className={cn('h-[48px] w-auto', className)}
    >
      <g transform="rotate(-18 44 28)">
        <rect x="10" y="24" width="44" height="9" rx="4.5" fill="#f4b8b0" />
        <path
          d="M20 33 L20 41 M30 33 L30 39"
          stroke="#f4b8b0"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="62" cy="28" r="14" fill="#8f86e0" />
        <circle cx="62" cy="28" r="5.5" fill="#5a4fc9" />
      </g>
    </svg>
  )
}

/** Coral group-of-people for the dissolve confirmation. */
export function RedPeopleIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 60"
      fill="none"
      aria-hidden="true"
      className={cn('h-[48px] w-auto', className)}
    >
      <circle cx="26" cy="12" r="10" fill="#f4473c" />
      <ellipse cx="26" cy="40" rx="17" ry="14" fill="#f4473c" />
      <circle cx="49" cy="15" r="7.5" fill="#e2352b" />
      <path
        d="M40 52 C41 42 46 37 53 37 C60 37 65 42 66 52 C61 56 55 58 49 58"
        fill="#e2352b"
      />
    </svg>
  )
}

/** White group-of-people for the save-group confirmation. */
export function WhitePeopleIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 60"
      fill="none"
      aria-hidden="true"
      className={cn('h-[44px] w-auto', className)}
    >
      <circle cx="26" cy="12" r="10" fill="#ffffff" />
      <ellipse cx="26" cy="40" rx="17" ry="14" fill="#ffffff" />
      <circle cx="49" cy="15" r="7.5" fill="#ffffff" />
      <path
        d="M40 52 C41 42 46 37 53 37 C60 37 65 42 66 52 C61 56 55 58 49 58"
        fill="#ffffff"
      />
    </svg>
  )
}
