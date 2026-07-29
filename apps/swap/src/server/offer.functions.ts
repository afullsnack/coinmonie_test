import type { Transaction } from '#/data/constants'
import { env } from '#/env'
import { betterFetch } from '@better-fetch/fetch'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {formatDistanceToNow} from "date-fns"

const SWITCH_API_URL = `https://api.onswitch.xyz`
const FILES = [
  'arbitrum.jpeg',
  'avalanche.jpeg',
  'base.png',
  'berachain.png',
  'bsc.jpeg',
  'celo.jpeg',
  'ethereum.png',
  'gnosis.png',
  'hyperevm.png',
  'linea.png',
  'mantle.jpeg',
  'monad.jpeg',
  'optimism.png',
  'plasma.jpeg',
  'polygon.png',
  'solana.png',
  'sonic.jpeg',
  'tron.jpeg',
  'usdc.png',
  'usdt.png',
]

export const bankLookup = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      bankCode: z.string().optional(),
			accountNumber: z.string().optional(),
			phoneNumber: z.string().optional(),
			mobileNetwork: z.string().optional(),
      country: z.string().default('NG')
    }),
  )
  .handler(async ({ data }) => {
    try {
      const { data: lookupBank, error } = await betterFetch<{
        success: boolean
        message: string
        timestamp: string
        data: {
          bank_code?: string
					account_number?: string
					phone_number?: string
          mobile_network?: string
          account_name: string
        }
      }>(`${SWITCH_API_URL}/institution/lookup`, {
        method: 'POST',
        headers: {
          'x-service-key': env.SWITCH_API_KEY,
        },
        body: JSON.stringify({
          country: data.country,
          beneficiary: {
            account_number: data.accountNumber,
						bank_code: data.bankCode,
						phone_number: data.phoneNumber,
            mobile_network: data.mobileNetwork
          },
        }),
      })

      if (error) {
        console.error(`[BetterFetch]: Failed to look up bank`, { error })
        throw error
      }

      return lookupBank.data
    } catch (error: any) {
      console.log(`Failed to look up bank`, { error })
      throw error
    }
	})

export const getInstitution = createServerFn()
	.validator(z.object({
		country: z.string().default('NG')
	}))
	.handler(async ({ data }) => {
		try {
			const { data: result, error } = await betterFetch<{
				success: boolean
        message: string
        timestamp: string
				data: Array<{
					code: string;
					name: string;
					[key: string]: any
				}>
			}>(`${SWITCH_API_URL}/institution`, {
				headers: {
					'x-service-key': env.SWITCH_API_KEY
				},
				query: {
					country: data.country
				}
			})

			if (error) {
				console.log(`[BetterFetch]: Failed to get institute`, { error })
				throw error
			}

			return result.data.map((d) => ({
				...d,
				id: d.code,
				logo: undefined
			}))
		}
		catch (error: any) {
			console.log(`Failed to get institution`, { error })
			throw error;
		}
	})

export const history = createServerFn({method: "GET"})
	.validator(z.object({
		limit: z.number().optional(),
		page: z.number().optional()
	}).optional())
	.handler(async ({ data }) => {
		try {
			const { data: historyResult, error } = await betterFetch<{
				success: boolean
	      message: string
	      timestamp: string
				data: {data: Array<Transaction>}
			}>(`${SWITCH_API_URL}/payment/history`, {
				headers: {
					'x-service-key': env.SWITCH_API_KEY
				}
			})

			if (error) {
				console.log(`Failed to get payment history`, { error })
				throw error
			}

			return historyResult.data.data.map((transaction) => ({
				date: formatDistanceToNow(new Date(transaction.created_at)),
				reference: transaction.reference,
				youWillSend: {amount: transaction.source.amount, currency: transaction.source.currency},
				youWillReceive: { amount: transaction.destination.amount, currency: transaction.destination.currency },
				status: transaction.status
			}))
		}
		catch (error: any) {
			console.log(`Failed to make payment history request`, { error })
			throw error
		}
	})

export const assetList = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const { data: assets, error } = await betterFetch<{
      success: boolean
      message: string
      timestamp: string
      data: Array<{
        id: string
        name: string
        code: string
        decimals: number
        address: string
        blockchain: {
          id: number
          name: string
          type?: string
        }
        offramp_supported: boolean
        onramp_supported: boolean
        swap_supported: boolean
        wallet_supported: boolean
        [key: string]: any
      }>
    }>(`${SWITCH_API_URL}/asset`, {
      headers: {
        'x-service-key': env.SWITCH_API_KEY,
      },
    })

    if (error) {
      console.log(`[BetterFetch] Failed to get assets`, { error })
      throw error
    }

		const files = FILES

		return assets.data.filter((asset) => asset.offramp_supported).map((asset) => {
      const assetMatcher = asset.code.toLowerCase()
      const networkMatcher = asset.blockchain.name.toLowerCase()
      const matchedAssetFile = files.find(
        (file) => file.split('.')[0] === assetMatcher,
      )
      const matchedNetworkFile = files.find(
        (file) => file.split('.')[0] === networkMatcher,
      )

      return {
        ...asset,
        url: `/assets/tokens/${matchedAssetFile}`,
        blockchain: {
          ...asset.blockchain,
          url: `/assets/tokens/${matchedNetworkFile}`,
        },
      }
    })
  } catch (error: any) {
    console.log(`Failed to get asset list`, { error })
    throw error
  }
})

export const getQuote = createServerFn()
  .validator(
    z.object({
      asset: z.string(),
			amount: z.number(),
			country: z.string().default('NG'),
      currency: z.string().default('NGN'),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const { data: quote, error } = await betterFetch<{
        success: boolean
        message: string
        timestamp: string
        data: {
          rate: number
          expiry: string
          settlement: string
          channel: string
          fee: {
            total: number
            platform: number
            developer: number
            currency: string
          }
          fee_inclusive: boolean
          source: {
            amount: number
            currency: string
          }
          destination: {
            amount: number
            currency: string
          }
        }
      }>(`${SWITCH_API_URL}/offramp/quote`, {
        method: 'POST',
        headers: {
          'x-service-key': env.SWITCH_API_KEY,
        },
        body: JSON.stringify({
          amount: data.amount,
          asset: data.asset,
          country: data.country,
          currency: data.currency,
          exact_output: false,
          // developer_fee: 0.5,
        }),
      })

      if (error) {
        console.log(`[BetterFetch] Failed to fetch quote`, { error })
        throw error
      }

      return quote.data
    } catch (error: any) {
      console.log(`Failed to get offer quote`, { error })
      throw error
    }
  })

export const initiateOffer = createServerFn()
  .validator(
    z.object({
      asset: z.string(),
			amount: z.number(),
			accountName: z.string().optional(),
			accountNumber: z.string().optional(),
			mobileNumber: z.string().optional(),
			mobileNetwork: z.string().optional(),
			bankCode: z.string().optional(),
			country: z.string().default('NG'),
      currency: z.string().default('NGN'),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const { data: quote, error } = await betterFetch<{
        success: boolean
        message: string
        timestamp: string
        data: {
          status: string
          type: string
          reference: string
          beneficiary: string
          rate: number
          developer_fee: {
            amount: number
            amount_usd: number
            currency: string
            network: string
          }
          source: {
            amount: number
            amount_usd: number
            network: string
            currency: string
          }
          destination: {
            amount: number
            amount_usd: number
            network: string
            currency: string
          }
          deposit: {
            amount: number
            address: string
            asset: string
            note: Array<string>
          }
          meta: any
          created_at: string
          updated_at: string
        }
      }>(`${SWITCH_API_URL}/offramp/initiate`, {
        method: 'POST',
        headers: {
          'x-service-key': env.SWITCH_API_KEY,
        },
        body: JSON.stringify({
          amount: data.amount,
          asset: data.asset,
          country: data.country,
          currency: data.currency,
					reference: crypto.randomUUID(),
					beneficiary: {
						holder_type: "INDIVIDUAL",
						holder_name: data.accountName,
						account_number: data.accountNumber,
						bank_code: data.bankCode,
						mobile_number: data.mobileNetwork,
						mobile_network: data.mobileNetwork,
					},
					sender_name: 'Coinmonie',
          reason: "REMITTANCE",
          developer_fee: 0.5,
          // developer_recipient: ``
        }),
      })

      if (error) {
        console.log(`[BetterFetch] Failed to fetch quote`, { error })
        throw error
      }

      return quote.data
    } catch (error: any) {
      console.log(`Failed to get offer quote`, { error })
      throw error
    }
  })

export const getRate = createServerFn()
  .validator(
    z.object({
			asset: z.string(),
			country: z.string().default('NG'),
      currency: z.string().default('NGN'),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const { data: rate, error } = await betterFetch<{
        success: boolean
        message: string
        timestamp: string
        data: { rate: number }
      }>(`${SWITCH_API_URL}/offramp/rate`, {
        method: 'POST',
        headers: {
          'x-service-key': env.SWITCH_API_KEY,
        },
        body: JSON.stringify({
          country: data.country,
          asset: data.asset,
          currency: data.currency,
        }),
      })

      if (error) {
        console.log(`[BetterFetch] Failed to get rate for: ${data.country}`, { error })
        throw error
      }

      return rate.data
    } catch (error: any) {
      console.log(`Failed to get rate`, { error })
      throw error
    }
  })
