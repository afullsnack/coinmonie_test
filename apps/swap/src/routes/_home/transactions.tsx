import { DataTable } from '#/components/data-table'
import { getHistoryQueryOptions } from '#/lib/api-client'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_home/transactions')({
  component: Transactions,
})

function Transactions() {
	const history = useQuery(getHistoryQueryOptions)
  console.log(`History X`, history.data)
  return (
    <div className="p-4 w-full text-primary">
      <DataTable data={history.data} />
    </div>
  )
}
