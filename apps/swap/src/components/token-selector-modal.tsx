import { useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { TOKENS, NETWORKS, type Token } from "@/data/constants";

interface TokenSelectorModalProps {
	open: boolean;
	onClose: () => void;
	onSelect: (token: Token) => void;
}

export function TokenSelectorModal({
	open,
	onClose,
	onSelect,
}: TokenSelectorModalProps) {
	const [search, setSearch] = useState("");
	const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);

	const filteredTokens = TOKENS.filter((token) => {
		const matchesSearch =
			token.name.toLowerCase().includes(search.toLowerCase()) ||
			token.symbol.toLowerCase().includes(search.toLowerCase());
		const matchesNetwork = selectedNetwork
			? token.network === selectedNetwork
			: true;
		return matchesSearch && matchesNetwork;
	});

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
			<div className="w-full max-w-md rounded-2xl bg-[#1a1f2e] border border-white/10 shadow-2xl">
				<div className="flex items-center justify-between p-4 border-b border-white/10">
					<h2 className="text-lg font-semibold text-white">
						Choose a token
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
					<p className="text-sm text-gray-400 mb-4">
						Select an option from the list or search for token.
					</p>

					<div className="relative mb-4">
						<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
						<input
							type="text"
							placeholder="Search by name, symbol or address"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full bg-[#0d1117] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
						/>
					</div>

					<div className="flex gap-2 mb-4 overflow-x-auto pb-2">
						<button
							type="button"
							onClick={() => setSelectedNetwork(null)}
							className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
								selectedNetwork === null
									? "bg-green-500 text-black"
									: "bg-white/10 text-gray-300 hover:bg-white/20"
							}`}
						>
							All Networks
						</button>
						{NETWORKS.map((network) => (
							<button
								key={network.id}
								type="button"
								onClick={() => setSelectedNetwork(network.id)}
								className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
									selectedNetwork === network.id
										? "bg-green-500 text-black"
										: "bg-white/10 text-gray-300 hover:bg-white/20"
								}`}
							>
								{network.name}
							</button>
						))}
					</div>

					<p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
						Trending tokens
					</p>

					<div className="space-y-1 max-h-80 overflow-y-auto">
						{filteredTokens.map((token) => (
							<button
								key={token.id}
								type="button"
								onClick={() => {
									onSelect(token);
									onClose();
								}}
								className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
							>
								<div
									className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
									style={{ backgroundColor: token.logoColor }}
								>
									{token.symbol.slice(0, 2)}
								</div>
								<div className="flex-1 text-left">
									<p className="text-white font-medium">
										{token.name}
									</p>
									<p className="text-sm text-gray-400">
										{token.symbol}
									</p>
								</div>
								<span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300">
									{NETWORKS.find((n) => n.id === token.network)
										?.name || token.network}
								</span>
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
