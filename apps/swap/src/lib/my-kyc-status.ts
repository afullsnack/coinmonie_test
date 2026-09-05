const STORAGE_KEY = `coinmonie:kyc-status`


export function getKYCStatus(): 'verified' | 'unverified' {
	if (typeof window === 'undefined') return 'unverified';
	try {
		const status = window.localStorage.getItem(STORAGE_KEY) as 'verified' | 'unverified' | null;
		return status ? status : "unverified"
	}
	catch {
		return 'unverified'
	}
}

export function saveKYCStatus(status: 'verified' | 'unverified') {
	if (typeof window === 'undefined') return 'unverified';
	window.localStorage.setItem(STORAGE_KEY, status);
}
