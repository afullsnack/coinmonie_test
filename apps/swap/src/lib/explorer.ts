const EXPLORER_BASE_URLS: Record<string, string> = {
	ethereum: 'https://etherscan.io/tx/',
	bsc: 'https://bscscan.com/tx/',
	polygon: 'https://polygonscan.com/tx/',
	arbitrum: 'https://arbiscan.io/tx/',
	optimism: 'https://optimistic.etherscan.io/tx/',
	base: 'https://basescan.org/tx/',
	avalanche: 'https://snowtrace.io/tx/',
	celo: 'https://celoscan.io/tx/',
	gnosis: 'https://gnosisscan.io/tx/',
	linea: 'https://lineascan.build/tx/',
	mantle: 'https://mantlescan.xyz/tx/',
	monad: 'https://explorer.monad.xyz/tx/',
	berachain: 'https://berascan.com/tx/',
	hyperevm: 'https://hyperevmscan.io/tx/',
	sonic: 'https://sonicscan.org/tx/',
	plasma: 'https://plasmascan.to/tx/',
	tron: 'https://tronscan.org/#/transaction/',
	solana: 'https://solscan.io/tx/',
}

// `asset` is stored as "network:token" (e.g. "bsc:usdt").
export function getExplorerUrl(asset: string | null | undefined, hash: string | null | undefined): string | null {
	if (!hash) return null
	const network = asset?.split(':')[0]?.toLowerCase()
	const base = network ? EXPLORER_BASE_URLS[network] : undefined
	return base ? `${base}${hash}` : null
}
