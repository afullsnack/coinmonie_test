import { useSyncExternalStore } from 'react'

export type ThemeChoice = 'dark' | 'light'
type ThemeState = { theme: ThemeChoice; followDevice: boolean }

const STORAGE_KEY = 'cm-theme'
const DEFAULT_STATE: ThemeState = { theme: 'dark', followDevice: false }
const listeners = new Set<() => void>()
let state: ThemeState | null = null

function read(): ThemeState {
  if (state) return state
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    state = raw ? { ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<ThemeState>) } : DEFAULT_STATE
  } catch {
    state = DEFAULT_STATE
  }
  return state
}

function resolve(next: ThemeState): ThemeChoice {
  if (!next.followDevice) return next.theme
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function apply(next: ThemeState) {
  const resolved = resolve(next)
  document.documentElement.classList.toggle('dark', resolved === 'dark')
  document.documentElement.dataset.theme = resolved
}

function write(patch: Partial<ThemeState>) {
  state = { ...read(), ...patch }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  apply(state)
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useThemePreference() {
  const current = useSyncExternalStore(subscribe, read, () => DEFAULT_STATE)
  return {
    theme: current.theme,
    followDevice: current.followDevice,
    setTheme: (theme: ThemeChoice) => write({ theme, followDevice: false }),
    setFollowDevice: (followDevice: boolean) => write({ followDevice }),
  }
}
