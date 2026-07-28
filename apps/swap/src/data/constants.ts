export interface Token {
	id: string;
	symbol: string;
	name: string;
	network: string;
	logoColor: string;
	address: string;
}

export interface Bank {
	id: number;
	name: string;
	code: string;
	category: string;
	logo: string;
}

export type Network = {
	id: number;
	name: string;
	type: string;
	url?: string;
}
export type Asset = {
	id: string;
	url?: string;
	name: string;
	code: string;
	decimals: number;
	address: string;
	blockchain: {
		id: number;
		name: string;
		type?: string;
	};
	offramp_supported: boolean;
	onramp_supported: boolean;
	swap_supported: boolean;
	wallet_supported: boolean;
}

export const NETWORKS = [
	{ id: "ethereum", name: "Ethereum" },
	{ id: "base", name: "Base" },
	{ id: "optimism", name: "Optimism" },
	{ id: "arbitrum", name: "Arbitrum" },
	{ id: "polygon", name: "Polygon" },
];

export const TOKENS: Token[] = [
	{ id: "usdc", symbol: "USDC", name: "USD Coin", network: "base", logoColor: "#2775ca", address: `0x`.padEnd(32, '0') },
	{ id: "usdt", symbol: "USDT", name: "Tether", network: "ethereum", logoColor: "#26a17b", address: `0x`.padEnd(32, '0') },
	{ id: "eth", symbol: "ETH", name: "Ethereum", network: "ethereum", logoColor: "#627eea", address: `0x`.padEnd(32, '0') },
	{ id: "dai", symbol: "DAI", name: "Dai", network: "base", logoColor: "#f5ac37", address: `0x`.padEnd(32, '0') },
	{ id: "wbtc", symbol: "WBTC", name: "Wrapped Bitcoin", network: "ethereum", logoColor: "#f7931a", address: `0x`.padEnd(32, '0') },
	{ id: "link", symbol: "LINK", name: "Chainlink", network: "ethereum", logoColor: "#2a5ada", address: `0x`.padEnd(32, '0') },
	{ id: "uni", symbol: "UNI", name: "Uniswap", network: "ethereum", logoColor: "#ff007a", address: `0x`.padEnd(32, '0') },
	{ id: "aave", symbol: "AAVE", name: "Aave", network: "ethereum", logoColor: "#b6509e", address: `0x`.padEnd(32, '0') },
	{ id: "matic", symbol: "POL", name: "Polygon", network: "polygon", logoColor: "#8247e5", address: `0x`.padEnd(32, '0') },
	{ id: "atom", symbol: "ATOM", name: "Cosmos", network: "ethereum", logoColor: "#2e3148", address: `0x`.padEnd(32, '0') },
];

export const FIAT_CURRENCIES = [
	{ id: "ngn", symbol: "NGN", name: "Nigerian Naira", rate: 1580.70 },
	{ id: "kes", symbol: "KES", name: "Kenyan Shilling", rate: 153.50 },
	{ id: "ghs", symbol: "GHS", name: "Ghanaian Cedi", rate: 14.85 },
	{ id: "zar", symbol: "ZAR", name: "South African Rand", rate: 18.25 },
	{ id: "eur", symbol: "EUR", name: "Euro", rate: 0.92 },
	{ id: "gbp", symbol: "GBP", name: "British Pound", rate: 0.79 },
];


export interface Transaction {
  status: "COMPLETED" | "PENDING" | "FAILED";
  type: "OFFRAMP" | "ONRAMP";
  reference: string;
  beneficiary: string;
  rate: number;
  source: TransactionSource;
  destination: TransactionDestination;
  deposit: TransactionDeposit;
  meta: TransactionMeta;
  created_at: string;
  updated_at: string;
}

export interface TransactionSource {
  amount: number;
  amount_usd: number;
  network: string;
  currency: string;
}

export interface TransactionDestination {
  amount: number;
  amount_usd: number;
  network: string;
  currency: string;
}

export interface TransactionDeposit {
  amount: number;
  address: string;
  asset: string;
  note: string[];
}

export interface TransactionMeta {
  sender: {
    wallet_address: string;
  };
  session_id: string;
  hash: string;
  explorer_url: string;
}
