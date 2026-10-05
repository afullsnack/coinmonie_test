import { cn } from 'cn'

const REGIONAL_INDICATOR_A = 0x1f1e6

/** Converts a flag emoji (🇳🇬) to its ISO 3166-1 alpha-2 code (NG). */
export function flagCode(flag: string) {
  const letters = Array.from(flag)
    .map((char) => char.codePointAt(0) ?? 0)
    .filter((point) => point >= REGIONAL_INDICATOR_A && point < REGIONAL_INDICATOR_A + 26)
    .map((point) => String.fromCharCode(point - REGIONAL_INDICATOR_A + 65))
  return letters.length === 2 ? letters.join('') : flag.toUpperCase()
}

const FLAGS: Record<string, React.ReactNode> = {
  NG: (
    <>
      <rect width="24" height="24" fill="#fff" />
      <rect width="8" height="24" fill="#008751" />
      <rect x="16" width="8" height="24" fill="#008751" />
    </>
  ),
  GH: (
    <>
      <rect width="24" height="8" fill="#ce1126" />
      <rect y="8" width="24" height="8" fill="#fcd116" />
      <rect y="16" width="24" height="8" fill="#006b3f" />
      <path d="M12 8.6l.8 2.4h2.5l-2 1.5.8 2.4-2.1-1.5-2.1 1.5.8-2.4-2-1.5h2.5z" fill="#000" />
    </>
  ),
  KE: (
    <>
      <rect width="24" height="24" fill="#fff" />
      <rect width="24" height="7" fill="#000" />
      <rect y="8.5" width="24" height="7" fill="#bb0000" />
      <rect y="17" width="24" height="7" fill="#006600" />
      <ellipse cx="12" cy="12" rx="2.6" ry="5" fill="#bb0000" stroke="#000" strokeWidth="0.8" />
      <ellipse cx="12" cy="12" rx="0.9" ry="3" fill="#fff" />
    </>
  ),
  ZA: (
    <>
      <rect width="24" height="12" fill="#e03c31" />
      <rect y="12" width="24" height="12" fill="#001489" />
      <path d="M0 4.5 L9 12 L0 19.5 Z" fill="#000" stroke="#ffb81c" strokeWidth="1.2" />
      <path d="M0 2 L11 9.5 H24 V14.5 H11 L0 22 V19 L9.5 12 L0 5 Z" fill="#007749" stroke="#fff" strokeWidth="1" />
    </>
  ),
  US: (
    <>
      <rect width="24" height="24" fill="#fff" />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} y={(i * 2 * 24) / 13} width="24" height={24 / 13} fill="#b22234" />
      ))}
      <rect width="11" height="13" fill="#3c3b6e" />
    </>
  ),
  GB: (
    <>
      <rect width="24" height="24" fill="#012169" />
      <path d="M0 0 L24 24 M24 0 L0 24" stroke="#fff" strokeWidth="5" />
      <path d="M0 0 L24 24 M24 0 L0 24" stroke="#c8102e" strokeWidth="2" />
      <path d="M12 0 V24 M0 12 H24" stroke="#fff" strokeWidth="7" />
      <path d="M12 0 V24 M0 12 H24" stroke="#c8102e" strokeWidth="4" />
    </>
  ),
  EU: (
    <>
      <rect width="24" height="24" fill="#003399" />
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * Math.PI) / 6
        return (
          <circle key={i} cx={12 + 6 * Math.sin(angle)} cy={12 - 6 * Math.cos(angle)} r="1" fill="#ffcc00" />
        )
      })}
    </>
  ),
}

/** Circular country flag. Accepts an ISO alpha-2 code or a flag emoji. */
export function Flag({ code, className }: { code: string; className?: string }) {
  const iso = flagCode(code)
  const art = FLAGS[iso]
  return (
    <span
      role="img"
      aria-label={iso}
      className={cn(
        'inline-flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2f2f2f] ring-1 ring-white/10',
        className,
      )}
    >
      {art ? (
        <svg viewBox="0 0 24 24" className="size-full" preserveAspectRatio="xMidYMid slice">
          {art}
        </svg>
      ) : (
        <span className="text-[0.7em] leading-none">{code}</span>
      )}
    </span>
  )
}
