import { useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { BANKS, type Bank } from "@/data/constants";

interface BankSelectorModalProps {
	open: boolean;
	onClose: () => void;
	onSelect: (bank: Bank) => void;
}

export function BankSelectorModal({
	open,
	onClose,
	onSelect,
}: BankSelectorModalProps) {
	const [search, setSearch] = useState("");

	const filteredBanks = BANKS.filter(
		(bank) =>
			bank.name.toLowerCase().includes(search.toLowerCase()) ||
			bank.country.toLowerCase().includes(search.toLowerCase()),
	);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
			<div className="w-full max-w-md rounded-2xl bg-[#1a1f2e] border border-white/10 shadow-2xl">
				<div className="flex items-center justify-between p-4 border-b border-white/10">
					<h2 className="text-lg font-semibold text-white">
						Choose a bank
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="p-1 rounded-full hover:bg-white/10 transition-colors"
					>
						<XIcon className="w-5 h-5 text-gray-400" />
					</button>
				</div>

				<div className="p-4">
					<div className="relative mb-4">
						<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
						<input
							type="text"
							placeholder="Search banks..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full bg-[#0d1117] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
						/>
					</div>

					<div className="space-y-1 max-h-80 overflow-y-auto">
						{filteredBanks.map((bank) => (
							<button
								key={bank.id}
								type="button"
								onClick={() => {
									onSelect(bank);
									onClose();
								}}
								className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
							>
								<div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
									{bank.logoInitial}
								</div>
								<div className="flex-1 text-left">
									<p className="text-white font-medium">
										{bank.name}
									</p>
									<p className="text-sm text-gray-400">
										{bank.country}
									</p>
								</div>
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
