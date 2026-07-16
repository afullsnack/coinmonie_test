export interface Token {
	id: string;
	symbol: string;
	name: string;
	network: string;
	logoColor: string;
}

export interface Bank {
	id: string;
	name: string;
	country: string;
	logoInitial: string;
}

export const NETWORKS = [
	{ id: "ethereum", name: "Ethereum" },
	{ id: "base", name: "Base" },
	{ id: "optimism", name: "Optimism" },
	{ id: "arbitrum", name: "Arbitrum" },
	{ id: "polygon", name: "Polygon" },
];

export const TOKENS: Token[] = [
	{ id: "usdc", symbol: "USDC", name: "USD Coin", network: "base", logoColor: "#2775ca" },
	{ id: "usdt", symbol: "USDT", name: "Tether", network: "ethereum", logoColor: "#26a17b" },
	{ id: "eth", symbol: "ETH", name: "Ethereum", network: "ethereum", logoColor: "#627eea" },
	{ id: "dai", symbol: "DAI", name: "Dai", network: "base", logoColor: "#f5ac37" },
	{ id: "wbtc", symbol: "WBTC", name: "Wrapped Bitcoin", network: "ethereum", logoColor: "#f7931a" },
	{ id: "link", symbol: "LINK", name: "Chainlink", network: "ethereum", logoColor: "#2a5ada" },
	{ id: "uni", symbol: "UNI", name: "Uniswap", network: "ethereum", logoColor: "#ff007a" },
	{ id: "aave", symbol: "AAVE", name: "Aave", network: "ethereum", logoColor: "#b6509e" },
	{ id: "matic", symbol: "POL", name: "Polygon", network: "polygon", logoColor: "#8247e5" },
	{ id: "atom", symbol: "ATOM", name: "Cosmos", network: "ethereum", logoColor: "#2e3148" },
];

export const FIAT_CURRENCIES = [
	{ id: "ngn", symbol: "NGN", name: "Nigerian Naira", rate: 1580.70 },
	{ id: "kes", symbol: "KES", name: "Kenyan Shilling", rate: 153.50 },
	{ id: "ghs", symbol: "GHS", name: "Ghanaian Cedi", rate: 14.85 },
	{ id: "zar", symbol: "ZAR", name: "South African Rand", rate: 18.25 },
	{ id: "eur", symbol: "EUR", name: "Euro", rate: 0.92 },
	{ id: "gbp", symbol: "GBP", name: "British Pound", rate: 0.79 },
];

export const BANKS: Bank[] = [
	{ id: "opay", name: "OPay", country: "Nigeria", logoInitial: "O" },
	{ id: "kuda", name: "Kuda Bank", country: "Nigeria", logoInitial: "K" },
	{ id: "moniepoint", name: "Moniepoint", country: "Nigeria", logoInitial: "M" },
	{ id: "palmplay", name: "PalmPay", country: "Nigeria", logoInitial: "P" },
	{ id: "gtbank", name: "GTBank", country: "Nigeria", logoInitial: "G" },
	{ id: "access", name: "Access Bank", country: "Nigeria", logoInitial: "A" },
	{ id: "stanbic", name: "Stanbic IBTC", country: "Nigeria", logoInitial: "S" },
	{ id: "zenith", name: "Zenith Bank", country: "Nigeria", logoInitial: "Z" },
	{ id: "firstbank", name: "First Bank", country: "Nigeria", logoInitial: "F" },
	{ id: "uba", name: "UBA", country: "Nigeria", logoInitial: "U" },
];
