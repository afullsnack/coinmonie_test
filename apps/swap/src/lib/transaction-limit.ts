import { db } from '#/db'

export const TRANSACTION_LIMIT_ENABLED_KEY = 'transaction_limit_enabled'
export const TRANSACTION_LIMIT_USD_KEY = 'transaction_limit_usd'

const DEFAULT_LIMIT_USD = 1000

export async function getTransactionLimit() {
	const rows = await db.query.appSettings.findMany({
		where: (appSettings, { inArray }) =>
			inArray(appSettings.key, [TRANSACTION_LIMIT_ENABLED_KEY, TRANSACTION_LIMIT_USD_KEY]),
	})
	const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value]))

	return {
		enabled: byKey[TRANSACTION_LIMIT_ENABLED_KEY] !== undefined
			? byKey[TRANSACTION_LIMIT_ENABLED_KEY] === 'true'
			: true,
		limitUsd: byKey[TRANSACTION_LIMIT_USD_KEY] !== undefined
			? Number(byKey[TRANSACTION_LIMIT_USD_KEY])
			: DEFAULT_LIMIT_USD,
	}
}
