import { mutationOptions, queryOptions } from '@tanstack/react-query'
import {
  adminListTransactions,
  adminStats,
  assetList,
  bankLookup,
  enabledCurrencies,
  getInstitution,
  getQuote,
  getRate,
  history,
  initiateOffer,
} from '#/server/offer.functions'
import {
  addAdmin,
  changeOwnPassword,
  deleteAdmin,
  listAdmins,
  resetAdminPassword,
} from '#/server/admin.functions'
import { toast } from 'sonner'

export type Coin = {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  fully_diluted_valuation: number
  total_volume: number
  high_24h: number
  low_24h: number
  price_change_24h: number
  price_change_percentage_24h: number
  market_cap_change_24h: number
  market_cap_change_percentage_24h: number
  circulating_supply: number
  total_supply: number
  max_supply: number
  ath: number
  ath_change_percentage: number
  ath_date: string
  atl: number
  atl_change_percentage: number
  atl_date: string
  roi: Roi | null
  last_updated: string
}

type Roi = {
  times: number
  currency: string
  percentage: number
}

export const bankListQueryOptions = (country: string) => queryOptions({
  retryOnMount: true,
  refetchOnWindowFocus: true,
  queryKey: ['bankList'],
  queryFn: async () => {
		try {
			if (country === "NG") {
	      const list = (await import('@/data/banks/nigeria.json')).default
	      return list.banks
			} else {
				const result = await getInstitution({ data: { country } })
				return result
			}
    } catch (error: any) {
      console.log(`Failed to fetch bank list`, { error })
      throw error
    }
  },
  initialData: [],
})

export const assetListQueryOptions = queryOptions({
  retryOnMount: true,
  refetchOnWindowFocus: true,
  gcTime: 30_000_000,
  // staleTime: 30_000,
  queryKey: ['assetList'],
  queryFn: async () => await assetList(),
  initialData: [],
})

export const getHistoryQueryOptions = (depositAddresses: string[]) => queryOptions({
  retryOnMount: true,
  refetchOnWindowFocus: true,
  gcTime: 30_000_000,
  queryKey: ['getHistory', depositAddresses],
  queryFn: async () => {
    const results = await Promise.all(
      depositAddresses.map((depositAddress) => history({ data: { depositAddress } }))
    )
    return results.flat().sort((a, b) => b.date.localeCompare(a.date))
  },
  enabled: depositAddresses.length > 0,
  initialData: [],
})

export const enabledCurrenciesQueryOptions = queryOptions({
  retryOnMount: true,
  gcTime: 30_000_000,
  queryKey: ['enabledCurrencies'],
  queryFn: async () => await enabledCurrencies(),
  initialData: [],
})

export const adminTransactionsQueryOptions = queryOptions({
  queryKey: ['admin', 'transactions'],
  queryFn: async () => await adminListTransactions(),
})

export const adminStatsQueryOptions = queryOptions({
  queryKey: ['admin', 'stats'],
  queryFn: async () => await adminStats(),
})

export const adminListQueryOptions = queryOptions({
  queryKey: ['admin', 'admins'],
  queryFn: async () => await listAdmins(),
})

export const addAdminMutationOptions = mutationOptions({
  mutationKey: ['admin', 'addAdmin'],
  mutationFn: async (values: { email: string; password: string; name: string }) =>
    await addAdmin({ data: values }),
})

export const resetAdminPasswordMutationOptions = mutationOptions({
  mutationKey: ['admin', 'resetAdminPassword'],
  mutationFn: async (values: { userId: string; password: string }) =>
    await resetAdminPassword({ data: values }),
})

export const deleteAdminMutationOptions = mutationOptions({
  mutationKey: ['admin', 'deleteAdmin'],
  mutationFn: async (values: { userId: string }) =>
    await deleteAdmin({ data: values }),
})

export const changeOwnPasswordMutationOptions = mutationOptions({
  mutationKey: ['admin', 'changeOwnPassword'],
  mutationFn: async (values: { password: string }) =>
    await changeOwnPassword({ data: values }),
})

export const offrampRateMutationOptions = mutationOptions({
  mutationKey: ['getOfframpRate'],
	mutationFn: async (values: { asset: string; country: string; currency: string }) =>
    getRate({
      data: {
				asset: values.asset,
				country: values.country,
				currency: values.currency,
      },
    }),
  onError(error) {
    toast.error(`Failed to get rate`, {
      description: error.message,
    })
  },
})

export const offrampQuoteMutationOptions = mutationOptions({
  mutationKey: ['getQuote'],
	mutationFn: async (values: {
		asset: string;
		amount: number;
		country: string;
		currency: string;
	}) =>
    getQuote({
      data: {
        asset: values.asset,
				amount: values.amount,
				country: values.country,
				currency: values.currency,
      },
    }),
  onError(error, ) {
    toast.error(`Failed to get quote`, {
      description: error.message,
    })
  },
})

export const initiateOfframpMutationOptions = mutationOptions({
  mutationKey: ['initiateOfframp'],
  mutationFn: async (values: {
    asset: string
    amount: number
    accountName?: string
    accountNumber?: string
		bankCode?: string
		country: string;
		currency: string;
		mobileNumber?: string;
		mobileNetwork?: string;
  }) =>
    initiateOffer({
      data: {
        asset: values.asset,
        amount: values.amount,
        accountName: values.accountName,
        accountNumber: values.accountNumber,
				bankCode: values.bankCode,
				country: values.country,
				currency: values.currency,
				mobileNumber: values.mobileNumber,
				mobileNetwork: values.mobileNetwork,
      },
    }),
  onError(error) {
    toast.error(`Failed to create transfer`, {
      description: error.message,
    })
  },
})

export const bankLookUpMutationOptions = mutationOptions({
  mutationKey: ['bankLookup'],
	mutationFn: async (values: {
		bankCode?: string;
		accountNumber?: string;
		mobileNetwork?: string;
		phoneNumber?: string;
		country: string
	}) =>
    await bankLookup({
			data: {
				accountNumber: values.accountNumber,
				bankCode: values.bankCode,
				country: values.country,
				mobileNetwork: values.mobileNetwork,
				phoneNumber: values.phoneNumber,
			},
    }),
  onError(error) {
    toast.error(`Could not get destination bank`, {
      description: error.message,
    })
  },
})
