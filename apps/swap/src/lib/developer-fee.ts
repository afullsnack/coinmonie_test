import { db } from '#/db'
import { env } from '#/env'

export const DEVELOPER_FEE_ENABLED_KEY = 'developer_fee_enabled'
export const DEVELOPER_FEE_PERCENT_KEY = 'developer_fee_percent'

export async function getDeveloperFee() {
	const rows = await db.query.appSettings.findMany({
		where: (appSettings, { inArray }) =>
			inArray(appSettings.key, [DEVELOPER_FEE_ENABLED_KEY, DEVELOPER_FEE_PERCENT_KEY]),
	})
	const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value]))

	return {
		enabled: byKey[DEVELOPER_FEE_ENABLED_KEY] !== undefined
			? byKey[DEVELOPER_FEE_ENABLED_KEY] === 'true'
			: env.FEATURE_FLAG_DEVELOPER_FEE,
		percent: byKey[DEVELOPER_FEE_PERCENT_KEY] !== undefined
			? Number(byKey[DEVELOPER_FEE_PERCENT_KEY])
			: env.DEVELOPER_FEE_PERCENT,
	}
}
