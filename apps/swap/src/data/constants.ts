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
	{ currency: "NGN", country: "NG", name: "Nigerian Naira", url: `/nigeria.png` },
	{ currency: "GHS", country: "GH", name: "Ghanaian Cedi", url: `/ghana.png` },
	{ currency: "KES", country: "KE", name: "Kenyan Shilings", url: `/kenya.png` },
	{ currency: "GMD", country: "GM", name: "Gambian Dalasi", url: `gambia.png` },
	{ currency: "XAF", country: "GA", name: "Garbon (Franc)", url: `garbon.png` },
	{ currency: "XOF", country: "SN", name: "Senegal (Franc)", url: `senegal.png` },
	{ currency: "XOF", country: "CI", name: "Ivory Coast (Franc)", url: `ivory-coast.png` },
];

export type Fiat = {
	currency: string;
	country: string;
	name: string;
	url: string;
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
