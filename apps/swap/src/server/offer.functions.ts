import { LOCAL } from '#/data/constants'
import { env } from '#/env'
import { db } from '#/db'
import { transactions } from '#/db/schema'
import { requireAdminSession } from '#/lib/require-admin-session'
import { enforceRateLimit } from '#/lib/rate-limit'
import { betterFetch } from '@better-fetch/fetch'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
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

export const enabledCurrencies = createServerFn({ method: 'GET' }).handler(async () => {
	return LOCAL.filter((fiat) => env.FEATURE_FLAG_CURRENCIES.includes(fiat.currency))
})

export const getCoverage = createServerFn({ method: 'GET' }).handler(async () => {
	try {
		const { data, error } = await betterFetch<{
			success: boolean
			message: string
			timestamp: string
			data: Array<{
				country: string
				currency: Array<string>
				channel: Array<string>
				payout_limit: Record<string, { min: string; max: string } | string>
			}>
		}>(`${SWITCH_API_URL}/coverage?direction=OFFRAMP`, {
			method: 'GET',
			headers: {
				'x-service-key': env.SWITCH_API_KEY,
			},
		})

		if (error) {
			console.log(`[BetterFetch] Failed to fetch coverage`, { error })
			throw error
		}

		const parseUsd = (value: string) => Number(value.replace(/[^0-9.]/g, ''))

		const limits: Record<string, Record<string, { min: number; max: number }>> = {}
		for (const entry of data.data) {
			limits[entry.country] = {}
			for (const channel of entry.channel) {
				const limit = entry.payout_limit[channel]
				if (limit && typeof limit === 'object') {
					limits[entry.country][channel] = {
						min: parseUsd(limit.min),
						max: parseUsd(limit.max),
					}
				}
			}
		}

		return limits
	} catch (error) {
		console.log(`Failed to get coverage`, { error })
		throw error
	}
})

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
    await enforceRateLimit(getRequest(), 'bankLookup', 20, 60_000)
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
		depositAddress: z.string(),
		limit: z.number().optional(),
		page: z.number().optional()
	}))
	.handler(async ({ data }) => {
		await enforceRateLimit(getRequest(), 'history', 40, 60_000)
		try {
			const rows = await db.query.transactions.findMany({
				where: (transactions, { eq, and, ne }) => and(
					eq(transactions.depositAddress, data.depositAddress),
					ne(transactions.status, 'AWAITING_DEPOSIT'),
				),
				orderBy: (transactions, { desc }) => desc(transactions.createdAt),
				limit: data.limit ?? 50,
				offset: data.page ? data.page * (data.limit ?? 50) : 0,
			})

			return rows.map((transaction) => ({
				date: formatDistanceToNow(transaction.createdAt),
				reference: transaction.reference,
				youWillSend: { amount: Number(transaction.sourceAmount), currency: transaction.sourceCurrency },
				youWillReceive: { amount: Number(transaction.destAmount), currency: transaction.destCurrency },
				status: transaction.status
			}))
		}
		catch (error: any) {
			console.log(`Failed to load transaction history`, { error })
			throw error
		}
	})

export const adminListTransactions = createServerFn({ method: 'GET' })
	.handler(async () => {
		await requireAdminSession()
		return await db.query.transactions.findMany({
			orderBy: (transactions, { desc }) => desc(transactions.createdAt),
		})
	})

export const adminStats = createServerFn({ method: 'GET' })
	.handler(async () => {
		await requireAdminSession()

		const rows = await db.query.transactions.findMany()
		const completed = rows.filter((t) => t.status === 'COMPLETED')
		const totalCompletedSourceUsd = completed.reduce((sum, t) => {
			const isStable = ['USDT', 'USDC'].some((s) => t.asset.toUpperCase().includes(s))
			return sum + (isStable ? Number(t.sourceAmount) : 0)
		}, 0)

		return {
			totalTransactions: rows.length,
			totalCompleted: completed.length,
			totalPending: rows.filter((t) => t.status !== 'COMPLETED' && t.status !== 'AWAITING_DEPOSIT').length,
			totalCompletedSourceUsd,
		}
	})

export const adminGetWebhookEventsForReference = createServerFn({ method: 'GET' })
	.validator(z.object({ reference: z.string() }))
	.handler(async ({ data }) => {
		await requireAdminSession()
		const rows = await db.query.webhookEvents.findMany({
			where: (webhookEvents, { eq }) => eq(webhookEvents.reference, data.reference),
			orderBy: (webhookEvents, { asc }) => asc(webhookEvents.receivedAt),
		})
		return rows.map((row) => ({
			...row,
			payload: JSON.stringify(row.payload),
		}))
	})

export const adminGetWebhookConfig = createServerFn({ method: 'GET' }).handler(async () => {
	await requireAdminSession()
	return {
		webhookUrl: env.SERVER_URL ? `${env.SERVER_URL}/api/webhooks/switch` : null,
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
    await enforceRateLimit(getRequest(), 'getQuote', 40, 60_000)
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
            amount_usd: number
            currency: string
            network: string
          }
          destination: {
            amount: number
            amount_usd: number
            currency: string
            network: string
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
          ...(env.FEATURE_FLAG_DEVELOPER_FEE
            ? { developer_fee: env.DEVELOPER_FEE_PERCENT }
            : {}),
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
    await enforceRateLimit(getRequest(), 'initiateOffer', 10, 60_000)
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
						mobile_number: data.mobileNumber,
						mobile_network: data.mobileNetwork,
					},
					sender_name: 'Coinmonie',
          reason: "REMITTANCE",
          ...(env.FEATURE_FLAG_DEVELOPER_FEE
            ? { developer_fee: env.DEVELOPER_FEE_PERCENT }
            : {}),
          ...(env.SERVER_URL ? { callback_url: `${env.SERVER_URL}/api/webhooks/switch` } : {}),
        }),
      })

      if (error) {
        console.log(`[BetterFetch] Failed to fetch quote`, { error })
        throw error
      }

      await db.insert(transactions).values({
        reference: quote.data.reference,
        depositAddress: quote.data.deposit.address,
        asset: data.asset,
        sourceAmount: String(quote.data.source.amount),
        sourceCurrency: quote.data.source.currency,
        destAmount: String(quote.data.destination.amount),
        destCurrency: quote.data.destination.currency,
        channel: data.mobileNumber ? 'MOBILEMONEY' : 'BANK',
        accountName: data.accountName ?? '',
        accountNumber: data.accountNumber ?? null,
        bankCode: data.bankCode ?? null,
        mobileNumber: data.mobileNumber ?? null,
        mobileNetwork: data.mobileNetwork ?? null,
        transactionHash: quote.data.meta?.hash ?? null,
        status: quote.data.status,
      })

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
    await enforceRateLimit(getRequest(), 'getRate', 40, 60_000)
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
