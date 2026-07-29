type ErrorDialogState = { description: string } | null

let state: ErrorDialogState = null
const listeners = new Set<() => void>()

export function showErrorDialog(description: string) {
  state = { description }
  listeners.forEach((listener) => listener())
}

export function dismissErrorDialog() {
  state = null
  listeners.forEach((listener) => listener())
}

export function subscribeErrorDialog(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getErrorDialogState() {
  return state
}
