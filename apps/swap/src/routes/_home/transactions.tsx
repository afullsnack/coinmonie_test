import { DataTable } from "#/components/data-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_home/transactions")({
  component: Transactions,
	loader: async () => {
		const data = await import("../../../transfers.json", {})
		return { transactions: data.default.transfers, account: data.default.account }
  }
});

function Transactions() {
	const data = Route.useLoaderData()
	return (
		<div className="p-4 w-full">
	    <DataTable data={data.transactions} />
		</div>
	);
}
