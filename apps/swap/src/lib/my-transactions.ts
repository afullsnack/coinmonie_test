const STORAGE_KEY = 'coinmonie:deposit-addresses'

export function getMyDepositAddresses(): string[] {
	if (typeof window === 'undefined') return []
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY)
		return raw ? (JSON.parse(raw) as string[]) : []
	} catch {
		return []
	}
}

export function addMyDepositAddress(address: string) {
	if (typeof window === 'undefined') return
	const existing = getMyDepositAddresses()
	if (existing.includes(address)) return
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify([address, ...existing]))
}
