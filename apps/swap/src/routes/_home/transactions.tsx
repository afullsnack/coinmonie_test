import { DataTable } from '#/components/data-table'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_home/transactions')({
  component: Transactions,
  loader: async () => {
    const data = {
      account: '0xc436c57f8c4...238ccCfDf0C39',
      transfers: [
        {
          date: 'Just now',
          reference: 'ACT_9kd82hf0qm4xzp1',
          youWillSend: { amount: 10, currency: 'USDC' },
          youWillReceive: { amount: 15812, currency: 'NGN' },
          status: 'Pending',
        },
        {
          date: '42 minutes ago',
          reference: 'ACT_ab7ncw913js6tq0',
          youWillSend: { amount: 5, currency: 'USDC' },
          youWillReceive: { amount: 7903, currency: 'NGN' },
          status: 'Completed',
        },
        {
          date: '3 hours ago',
          reference: 'ACT_z1p4kd77mn9vgxr',
          youWillSend: { amount: 1, currency: 'USDC' },
          youWillReceive: { amount: 1583, currency: 'NGN' },
          status: 'Completed',
        },
        {
          date: '8 hours ago',
          reference: 'ACT_qw3rty88uio2plk',
          youWillSend: { amount: 25, currency: 'USDC' },
          youWillReceive: { amount: 39620, currency: 'NGN' },
          status: 'Completed',
        },
        {
          date: '1 day ago',
          reference: 'ACT_mn5bvc44xza1qwe',
          youWillSend: { amount: 2.5, currency: 'USDC' },
          youWillReceive: { amount: 3958, currency: 'NGN' },
          status: 'Completed',
        },
        {
          date: '1 day ago',
          reference: 'ACT_ljaxky3zpl7xr23',
          youWillSend: { amount: 1, currency: 'USDC' },
          youWillReceive: { amount: 1590, currency: 'NGN' },
          status: 'Completed',
        },
        {
          date: '2 days ago',
          reference: 'ACT_pl0okm99ijn3uhb',
          youWillSend: { amount: 100, currency: 'USDC' },
          youWillReceive: { amount: 159040, currency: 'NGN' },
          status: 'Completed',
        },
        {
          date: '3 days ago',
          reference: 'ACT_tp4lrdtonr9nooc',
          youWillSend: { amount: 50, currency: 'USDC' },
          youWillReceive: { amount: 79513, currency: 'NGN' },
          status: 'Completed',
        },
        {
          date: '3 days ago',
          reference: 'ACT_v8xczn552gvf9or',
          youWillSend: { amount: 10, currency: 'USDC' },
          youWillReceive: { amount: 15906, currency: 'NGN' },
          status: 'Completed',
        },
        {
          date: '4 days ago',
          reference: 'ACT_tvxbschsvoew9os',
          youWillSend: { amount: 6.035187, currency: 'USDC' },
          youWillReceive: { amount: 9678, currency: 'NGN' },
          status: 'Completed',
        },
        {
          date: '5 days ago',
          reference: 'ACT_atrb4rdyuh9cx2v',
          youWillSend: { amount: 1.650041, currency: 'USDC' },
          youWillReceive: { amount: 2646, currency: 'NGN' },
          status: 'Completed',
        },
        {
          date: '6 days ago',
          reference: 'ACT_hj8gfd22sqw5azx',
          youWillSend: { amount: 3.48291, currency: 'USDC' },
          youWillReceive: { amount: 5541, currency: 'NGN' },
          status: 'Failed',
        },
      ],
    }
    return {
      transactions: data.transfers,
      account: data.account,
    }
  },
})

function Transactions() {
  const data = Route.useLoaderData()
  return (
    <div className="p-4 w-full text-primary">
      <DataTable data={data.transactions} />
    </div>
  )
}
