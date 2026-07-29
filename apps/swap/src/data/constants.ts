export interface Token {
	id: string;
	symbol: string;
	name: string;
	network: string;
	logoColor: string;
	address: string;
}

export interface Bank {
	id: number | string;
	name: string;
	code: string;
	category?: string;
	logo?: string;
}

export type Network = {
	id: number;
	name: string;
	type: string;
	url?: string;
	[key: string]: any
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


export const LOCAL = [
	{ currency: "NGN", country: "NG", name: "Nigerian Naira", url: `/nigeria.png`, mobileLength: 10 },
	{ currency: "GHS", country: "GH", name: "Ghanaian Cedi", url: `/ghana.png`, mobileLength: 9 },
	{ currency: "KES", country: "KE", name: "Kenyan Shilling", url: `/kenya.png`, mobileLength: 9 },
	{ currency: "GMD", country: "GM", name: "Gambian Dalasi", url: `/gambia.png`, mobileLength: 7 },
	{ currency: "XAF", country: "GA", name: "Gabonese Franc", url: `/garbon.png`, mobileLength: 8 },
	{ currency: "XOF", country: "SN", name: "Senegalese Franc", url: `/senegal.png`, mobileLength: 9 },
	{ currency: "XOF", country: "CI", name: "Ivory Coast Franc", url: `/ivory-coast.png`, mobileLength: 10 },
	{ currency: "ZAR", country: "ZA", name: "South African Rand", url: `🇿🇦`, mobileLength: 9 },
	{ currency: "CDF", country: "CD", name: "Congolese Franc", url: `🇨🇩`, mobileLength: 9 },
	{ currency: "GNF", country: "GN", name: "Guinean Franc", url: `🇬🇳`, mobileLength: 9 },
	{ currency: "UGX", country: "UG", name: "Ugandan Shilling", url: `🇺🇬`, mobileLength: 9 },
	{ currency: "ETB", country: "ET", name: "Ethiopian Birr", url: `🇪🇹`, mobileLength: 9 },
	{ currency: "XAF", country: "CM", name: "Central African CFA Franc", url: `🇨🇲`, mobileLength: 9 },
	{ currency: "RWF", country: "RW", name: "Rwandan Franc", url: `🇷🇼`, mobileLength: 9 },
	{ currency: "XOF", country: "BJ", name: "Benin Franc", url: `🇧🇯`, mobileLength: 8 },
	{ currency: "XOF", country: "ML", name: "Malian Franc", url: `🇲🇱`, mobileLength: 8 },
	{ currency: "TZS", country: "TZ", name: "Tanzanian Shilling", url: `🇹🇿`, mobileLength: 9 },
	{ currency: "ZMW", country: "ZM", name: "Zambian Kwacha", url: `🇿🇲`, mobileLength: 9 },
	{ currency: "SLE", country: "SL", name: "Sierra Leonean Leone", url: `🇸🇱`, mobileLength: 8 },
	{ currency: "MWK", country: "MW", name: "Malawian Kwacha", url: `🇲🇼`, mobileLength: 9 },
	{ currency: "LRD", country: "LR", name: "Liberian Dollar", url: `🇱🇷`, mobileLength: 8 },
];

export const isFlagImage = (url: string) => url.startsWith('/');

export type Fiat = {
	currency: string;
	country: string;
	name: string;
	url: string;
	mobileLength: number;
}

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
