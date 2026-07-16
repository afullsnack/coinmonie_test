import { DataTable } from "#/components/data-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_home/transactions")({
  component: Transactions,
	ssr: false,
});

const MOCK_TRANSACTIONS = [
	{
		id: "tx_1",
		date: "2026-07-15 14:32",
		sendAmount: "10",
		sendToken: "USDC",
		receiveAmount: "15,807",
		receiveCurrency: "NGN",
		bank: "OPay",
		account: "8188216769",
		status: "completed",
		txHash: "0x43805718047F7340F23800C1D10039",
	},
	{
		id: "tx_2",
		date: "2026-07-14 09:15",
		sendAmount: "50",
		sendToken: "USDC",
		receiveAmount: "79,035",
		receiveCurrency: "NGN",
		bank: "Kuda Bank",
		account: "2012345678",
		status: "completed",
		txHash: "0x8921ab34cd5678ef901234567890abc",
	},
	{
		id: "tx_3",
		date: "2026-07-12 18:45",
		sendAmount: "5",
		sendToken: "ETH",
		receiveAmount: "14,200",
		receiveCurrency: "KES",
		bank: "M-Pesa",
		account: "+254712345678",
		status: "pending",
		txHash: "0x1234567890abcdef1234567890abcdef",
	},
	{
		id: "tx_4",
		date: "2026-07-10 11:20",
		sendAmount: "100",
		sendToken: "USDT",
		receiveAmount: "158.50",
		receiveCurrency: "EUR",
		bank: "Revolut",
		account: "GB29NWBK60161331926819",
		status: "completed",
		txHash: "0xabcdef1234567890abcdef1234567890",
	},
	{
		id: "tx_5",
		date: "2026-07-08 16:00",
		sendAmount: "25",
		sendToken: "USDC",
		receiveAmount: "4,625",
		receiveCurrency: "ZAR",
		bank: "Standard Bank",
		account: "10123456789",
		status: "failed",
		txHash: "0x9876543210fedcba9876543210fedcba",
	},
];

function getStatusColor(status: string) {
	switch (status) {
		case "completed":
			return "bg-green-500/20 text-green-400";
		case "pending":
			return "bg-yellow-500/20 text-yellow-400";
		case "failed":
			return "bg-red-500/20 text-red-400";
		default:
			return "bg-gray-500/20 text-gray-400";
	}
}

function Transactions() {
	return (
    // <DataTable data={MOCK_TRANSACTIONS} />
    <div>Transactions</div>
	);
}
