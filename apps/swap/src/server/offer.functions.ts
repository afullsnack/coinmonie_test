import { env } from "#/env";
import { betterFetch } from "@better-fetch/fetch";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import path from "path"
import fs from "fs/promises"

const SWITCH_API_URL = `https://api.onswitch.xyz`

export const bankLookup = createServerFn({method: "POST"})
	.validator(z.object({
		bankCode: z.string(),
		accountNumber: z.string(),
	}))
	.handler(async ({data}) => {
		try {
			const { data: lookupBank, error } = await betterFetch<{
				success: boolean;
				message: string;
				timestamp: string;
				data: {
					bank_code: string;
					account_number: string;
					account_name: string;
				}
			}>(`${SWITCH_API_URL}/institution/lookup`, {
				method: "POST",
				headers: {
					'x-service-key': env.SWITCH_API_KEY
				},
				body: JSON.stringify({
					country: "NG",
					beneficiary: {
						account_number: data.accountNumber,
						bank_code: data.bankCode
					}
				})
			})

			if (error) {
				console.error(`[BetterFetch]: Failed to look up bank`, { error })
				throw error
			}

			return lookupBank.data
		}
		catch (error: any) {
			console.log(`Failed to look up bank`, { error })
			throw error
		}
	})


export const assetList = createServerFn({method: "GET"})
	.handler(async () => {
		try {
			const { data: assets, error } = await betterFetch<{
				success: string;
				message: string;
				timestamp: string;
				data: Array<{
					id: string;
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
					[key: string]: any
				}>
			}>(`${SWITCH_API_URL}/asset`, {
				headers: {
					'x-service-key': env.SWITCH_API_KEY
				}
			});

			if (error) {
				console.log(`[BetterFetch] Failed to get assets`, { error })
				throw error;
			}

			const dir = env.NODE_ENV === "development"? `./public/assets/tokens` : `../assets/tokens`;
			const files = await fs.readdir(dir)


			return assets.data.map((asset) => {
				const assetMatcher = asset.code.toLowerCase()
				const networkMatcher = asset.blockchain.name.toLowerCase()
				const matchedAssetFile = files.find((file) => file.split('.')[0] === assetMatcher)
				const matchedNetworkFile = files.find((file) => file.split('.')[0] === networkMatcher)

				return {
					...asset,
					url: `/assets/tokens/${matchedAssetFile}`,
					blockchain: {
						...asset.blockchain,
						url: `/assets/tokens/${matchedNetworkFile}`
					}
				}
			})
		}
		catch (error: any) {
			console.log(`Failed to get asset list`, { error })
			throw error;
		}
	})


export const getQuote = createServerFn()
	.validator(z.object({
		asset: z.string(),
		amount: z.number()
	}))
	.handler(async ({data}) => {
		try {
			const { data: quote, error } = await betterFetch<{
				success: boolean;
				message: string;
				timestamp: string;
				data: Array<{
					rate: number;
					expiry: string;
					settlement: string;
					channel: string;
					fee: {
						total: number;
						platform: number;
						developer: number;
						currency: string;
					};
					fee_inclusive: boolean;
					source: {
						amount: number;
						currency: string;
					};
					destination: {
						amount: number;
						currency: string;
					};
				}>
			}>(`${SWITCH_API_URL}/offramp/quote`, {
				method: "POST",
				headers: {
					'x-service-key': env.SWITCH_API_KEY
				},
				body: JSON.stringify({
					amount: data.amount,
					asset: data.asset,
					country: "NG",
					currency: "NGN",
					channel: "BANK",
					exact_output: false,
					developer_fee: 0.5,
					// developer_recipient: ``
				})
			});

			if (error) {
				console.log(`[BetterFetch] Failed to fetch quote`, { error })
				throw error;
			}

			return quote.data
		}
		catch (error: any) {
			console.log(`Failed to get offer quote`, { error })
			throw error;
		}
	})


export const getRate = createServerFn()
	.validator(z.object({
		asset: z.string()
	}))
	.handler(async ({data}) => {
		try {
			const { data: rate, error } = await betterFetch<{
				success: boolean;
				message: string;
				timestamp: string;
				data: { rate: number; };
			}>(`${SWITCH_API_URL}/offramp/rates`, {
				method: "POST",
				headers: {
					'x-service-key': env.SWITCH_API_KEY,
				},
				body: JSON.stringify({
					country: "NG",
					asset: data.asset,
					currency: "NGN"
				})
			});

			if (error) {
				console.log(`Failed to get rate`, { error })
				throw error;
			}

			return rate.data
		}
		catch (error: any) {
			console.log(`Failed to get rate`, { error })
			throw error;
		}
	})
