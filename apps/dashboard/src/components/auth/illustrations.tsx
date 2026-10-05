import { cn } from 'cn'

/**
 * Inline SVG approximations of the CoinMonie illustrations used on the auth
 * screens: the green coin logo, the teal flower-check badge and the envelope
 * with a notification badge.
 */

export function CoinLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 78"
      fill="none"
      aria-hidden="true"
      className={cn('h-[63px] w-auto', className)}
    >
      <defs>
        <linearGradient
          id="cm-coin-body"
          x1="12"
          y1="66"
          x2="78"
          y2="18"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#0b3d2c" />
          <stop offset="0.45" stopColor="#158249" />
          <stop offset="1" stopColor="#2eb05f" />
        </linearGradient>
        <linearGradient
          id="cm-coin-body-2"
          x1="18"
          y1="20"
          x2="72"
          y2="70"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#2eb05f" />
          <stop offset="1" stopColor="#0d452f" />
        </linearGradient>
        <linearGradient
          id="cm-coin-face"
          x1="52"
          y1="12"
          x2="92"
          y2="52"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#f4e3b0" />
          <stop offset="1" stopColor="#d9b763" />
        </linearGradient>
        <linearGradient
          id="cm-coin-rim"
          x1="48"
          y1="26"
          x2="94"
          y2="26"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#e6c980" />
          <stop offset="1" stopColor="#b98f3e" />
        </linearGradient>
      </defs>
      {/* green rolled body */}
      <path
        d="M10 62 C4 56 6 44 16 34 C28 22 44 16 58 14 L82 14 C88 14 92 18 92 24 C92 42 78 58 58 66 C40 73 20 72 10 62 Z"
        fill="url(#cm-coin-body)"
      />
      <path
        d="M10 62 C4 56 6 44 16 34 C28 22 44 16 58 14 L60 14 C48 22 38 32 34 44 C31 54 34 62 42 66 C32 72 18 71 10 62 Z"
        fill="url(#cm-coin-body-2)"
        opacity="0.55"
      />
      {/* gold coin face */}
      <ellipse cx="72" cy="26" rx="22" ry="20" fill="url(#cm-coin-rim)" />
      <ellipse cx="72" cy="25" rx="20" ry="18" fill="url(#cm-coin-face)" />
      <ellipse
        cx="72"
        cy="25"
        rx="14.5"
        ry="13"
        stroke="#c19b4a"
        strokeWidth="1.6"
      />
      <path
        d="M78 19.5 C76 18 73.5 17.5 71 18 C67.5 18.6 65 21.4 65 25 C65 28.6 67.5 31.4 71 32 C73.5 32.5 76 32 78 30.5"
        stroke="#b98f3e"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function FlowerCheck({ className }: { className?: string }) {
  const petals = Array.from({ length: 10 }, (_, i) => (i * 360) / 10)
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      aria-hidden="true"
      className={cn('h-[88px] w-[88px]', className)}
    >
      <defs>
        <linearGradient
          id="cm-flower"
          x1="20"
          y1="20"
          x2="80"
          y2="84"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#8fd8e8" />
          <stop offset="1" stopColor="#3fb3d4" />
        </linearGradient>
      </defs>
      <g>
        {petals.map((angle) => (
          <circle
            key={angle}
            cx="48"
            cy="26"
            r="16"
            fill="url(#cm-flower)"
            transform={`rotate(${angle} 48 48)`}
          />
        ))}
        <circle cx="48" cy="48" r="30" fill="url(#cm-flower)" />
      </g>
      <path
        d="M34 49 L44 59 L63 39"
        stroke="#ffffff"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M34 49 L44 59 L63 39"
        stroke="#dff3fa"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.65"
      />
    </svg>
  )
}

export function EnvelopeBadge({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 76 64"
      fill="none"
      aria-hidden="true"
      className={cn('h-[52px] w-auto', className)}
    >
      <defs>
        <linearGradient
          id="cm-env"
          x1="18"
          y1="12"
          x2="62"
          y2="58"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#f7f0d4" />
          <stop offset="1" stopColor="#e8dc9f" />
        </linearGradient>
        <linearGradient
          id="cm-env-flap"
          x1="20"
          y1="10"
          x2="64"
          y2="36"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fdf8e2" />
          <stop offset="1" stopColor="#ece299" />
        </linearGradient>
      </defs>
      <rect x="16" y="16" width="54" height="42" rx="7" fill="url(#cm-env)" />
      <path
        d="M16 23 C16 18.6 19.6 16 24 16 L62 16 C66.4 16 70 18.6 70 23 L70 26 L16 26 Z"
        fill="url(#cm-env-flap)"
      />
      <path
        d="M17.5 18 L43 38 L68.5 18"
        stroke="#d8c86e"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* notification badge */}
      <circle cx="15" cy="14" r="10" fill="#f4511e" />
      <circle cx="15" cy="14" r="10" stroke="#d0390c" strokeWidth="1.4" />
      <path
        d="M15 9.4 L15 15.4"
        stroke="#ffffff"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="15" cy="19.4" r="1.5" fill="#ffffff" />
    </svg>
  )
}

export function PadlockIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 84"
      fill="none"
      aria-hidden="true"
      className={cn('h-[63px] w-auto', className)}
    >
      <defs>
        <linearGradient
          id="cm-lock-purple"
          x1="52"
          y1="34"
          x2="92"
          y2="76"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#b07ce8" />
          <stop offset="1" stopColor="#8748c9" />
        </linearGradient>
        <linearGradient
          id="cm-lock-orange"
          x1="8"
          y1="30"
          x2="52"
          y2="78"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#f8b84a" />
          <stop offset="1" stopColor="#ef8c1f" />
        </linearGradient>
      </defs>
      {/* purple lock (back right) */}
      <path
        d="M58 34 C58 22 66 14 76 14 C86 14 93 22 93 33 L93 42 L84 42 L84 33 C84 27 81 23 76 23 C71 23 67 27 67 33 L67 42 L58 42 Z"
        fill="#e9e4ee"
      />
      <rect
        x="53"
        y="38"
        width="44"
        height="40"
        rx="10"
        fill="url(#cm-lock-purple)"
      />
      <path d="M70 53 L72 62 L66 62 L68 53 Z" fill="#5c2f92" />
      <circle cx="75" cy="52" r="3.4" fill="#5c2f92" />
      {/* orange lock (front left) */}
      <path
        d="M14 32 C14 20 22 12 32 12 C42 12 50 20 50 31 L50 44 L40 44 L40 31 C40 25 37 21 32 21 C27 21 23 25 23 31 L23 44 L14 44 Z"
        fill="#f3ede2"
      />
      <rect
        x="4"
        y="36"
        width="52"
        height="46"
        rx="11"
        fill="url(#cm-lock-orange)"
      />
      <circle cx="30" cy="55" r="5" fill="#a85a10" />
      <rect x="27.5" y="58" width="5" height="11" rx="2.5" fill="#a85a10" />
    </svg>
  )
}

export function UnlockIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 88 84"
      fill="none"
      aria-hidden="true"
      className={cn('h-[67px] w-auto', className)}
    >
      <defs>
        <linearGradient
          id="cm-unlock-body"
          x1="24"
          y1="30"
          x2="72"
          y2="80"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#8fa4f5" />
          <stop offset="1" stopColor="#5a6fe0" />
        </linearGradient>
      </defs>
      {/* open shackle */}
      <path
        d="M30 34 C30 18 40 8 52 8 C60 8 66 11 70 17 L62 24 C59 20 56 18 52 18 C46 18 41 24 41 34 L41 40 L30 40 Z"
        fill="#f2cf4a"
      />
      {/* dangling key detail */}
      <rect
        x="58"
        y="14"
        width="24"
        height="7"
        rx="3.5"
        fill="#4c63d8"
        transform="rotate(18 58 14)"
      />
      <circle cx="64" cy="20" r="1.8" fill="#dbe4ff" />
      <circle cx="69" cy="22" r="1.8" fill="#dbe4ff" />
      {/* body */}
      <rect
        x="14"
        y="30"
        width="56"
        height="50"
        rx="12"
        fill="url(#cm-unlock-body)"
        transform="rotate(-8 42 55)"
      />
      <circle cx="40" cy="56" r="6" fill="#33409f" />
      <rect
        x="37"
        y="60"
        width="6"
        height="12"
        rx="3"
        fill="#33409f"
        transform="rotate(-8 40 66)"
      />
    </svg>
  )
}
