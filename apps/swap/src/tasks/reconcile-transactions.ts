import { defineTask } from "nitro/task";
import { reconcileStuckTransactions } from "#/lib/reconcile-transactions";

export default defineTask({
	meta: {
		name: "transactions:reconcile",
		description:
			"Re-check non-terminal transactions against Switch and correct any that drifted from a missed webhook",
	},
	async run() {
		const result = await reconcileStuckTransactions();
		return { result };
	},
});
