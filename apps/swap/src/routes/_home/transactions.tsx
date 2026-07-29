import { DataTable } from '#/components/data-table'
import { getHistoryQueryOptions } from '#/lib/api-client'
import { getMyDepositAddresses } from '#/lib/my-transactions'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_home/transactions')({
  component: Transactions,
})

function Transactions() {
  const depositAddresses = getMyDepositAddresses()
	const history = useQuery(getHistoryQueryOptions(depositAddresses))
  return (
    <div className="p-4 w-full text-primary">
      {depositAddresses.length === 0 ? (
        <p className="text-sm text-muted-foreground p-4">
          No transfers yet. Once you create a transfer, it will show up here.
        </p>
      ) : (
        <DataTable data={history.data} />
      )}
    </div>
  )
}
