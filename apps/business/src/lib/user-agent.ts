const OS: Array<[RegExp, (match: RegExpMatchArray) => string]> = [
  [/iPhone OS (\d+[_\d]*)/, (m) => `iOS ${m[1].replace(/_/g, '.')}`],
  [/iPad.*OS (\d+[_\d]*)/, (m) => `iPadOS ${m[1].replace(/_/g, '.')}`],
  [/Android (\d+(?:\.\d+)*)/, (m) => `Android ${m[1]}`],
  [/Mac OS X (\d+[_\d]*)/, (m) => `macOS ${m[1].replace(/_/g, '.')}`],
  [/Windows NT (\d+\.\d+)/, () => 'Windows'],
  [/CrOS/, () => 'ChromeOS'],
  [/Linux/, () => 'Linux'],
]

const BROWSERS: Array<[RegExp, string]> = [
  [/Edg\//, 'Edge'],
  [/OPR\//, 'Opera'],
  [/Firefox\//, 'Firefox'],
  [/CriOS|Chrome\//, 'Chrome'],
  [/Safari\//, 'Safari'],
]

/** "Chrome • macOS 15.2"-style label for a session's user agent. */
export function describeUserAgent(userAgent: string | null | undefined) {
  if (!userAgent) return 'Unknown device'
  const device = /iPhone/.test(userAgent)
    ? 'iPhone'
    : /iPad/.test(userAgent)
      ? 'iPad'
      : BROWSERS.find(([pattern]) => pattern.test(userAgent))?.[1]
  let os: string | undefined
  for (const [pattern, format] of OS) {
    const match = userAgent.match(pattern)
    if (match) {
      os = format(match)
      break
    }
  }
  return [device ?? 'Browser', os].filter(Boolean).join(' • ')
}
