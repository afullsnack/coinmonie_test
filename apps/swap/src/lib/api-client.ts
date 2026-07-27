import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { betterFetch } from "@better-fetch/fetch";
import { assetList, bankLookup, getQuote, getRate } from "#/server/offer.functions";

export type Coin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: Roi | null;
  last_updated: string;
};

type Roi = {
  times: number;
  currency: string;
  percentage: number;
};


const COINGECKO_API_URL = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd`

export const tokenQueryOptions = queryOptions({
	retryOnMount: true,
	refetchOnWindowFocus: false,
	gcTime: 30_000,
	staleTime: 60_000,
	queryKey: ['getTokens'],
	queryFn: async () => {
		const { data, error } = await betterFetch<Coin[]>(COINGECKO_API_URL)
		if (error) {
			console.log(`Error fetching tokens`, { error })

			throw error
		}
		return data
	}
})

export const bankListQueryOptions = queryOptions({
	retryOnMount: true,
	refetchOnWindowFocus: true,
	gcTime: 30_000_000,
	queryKey: ['bankList'],
	queryFn: async () => {
		try {
			const list = (await import("@/data/banks/nigeria.json")).default
			return list.banks
		}
		catch (error: any) {
			console.log(`Failed to fetch bank list`, { error })
			throw error
		}
	},
	initialData: []
})

export const assetListQueryOptions = queryOptions({
	retryOnMount: true,
	refetchOnWindowFocus: true,
	gcTime: 30_000_000,
	// staleTime: 30_000,
	queryKey: ['assetList'],
	queryFn: async () => await assetList(),
	initialData: []
})

export const offrampRateMutationOptions = mutationOptions({
	mutationKey: ['getOfframpRate'],
	mutationFn: async (values: { asset: string; }) => getRate({
		data: {
			asset: values.asset
		}
	})
})

export const offrampQuoteMutationOptions = mutationOptions({
	mutationKey: ['getQuote'],
	mutationFn: async (values: { asset: string; amount: number; }) => getQuote({
		data: {
			asset: values.asset,
			amount: values.amount
		}
	})
})

export const bankLookUpMutationOptions = mutationOptions({
	mutationKey: ['bankLookup'],
	mutationFn: async (values: { bankCode: string; accountNumber: string }) =>
		await bankLookup({ data: { accountNumber: values.accountNumber, bankCode: values.bankCode } })
})
