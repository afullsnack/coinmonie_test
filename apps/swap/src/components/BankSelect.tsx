

export default function BankSelect() {
  return (
    <div className="grid grid-cols-2 gap-3">
			<button
				type="button"
				onClick={() => setIsBankModalOpen(true)}
				className="flex items-center justify-between bg-[#1a1f2e] rounded-xl px-4 py-3 hover:bg-white/5 transition-colors"
			>
				<span className="text-gray-400 text-sm">
					{selectedBank
						? selectedBank.name
						: "Choose bank"}
				</span>
				<ChevronDownIcon className="w-4 h-4 text-gray-400" />
			</button>
			<input
				type="text"
				placeholder="Enter account number"
				value={accountNumber}
				onChange={(e) =>
					setAccountNumber(e.target.value)
				}
				className="bg-[#1a1f2e] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
			/>
		</div>
  )
}
