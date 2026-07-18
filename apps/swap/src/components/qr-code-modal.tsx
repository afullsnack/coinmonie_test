import { useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { BANKS, type Bank } from "@/data/constants";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "./ui/item";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface QRCodeModalProps {
	open: boolean;
	onClose: () => void;
	onSelect: (bank: Bank) => void;
	children: React.ReactNode;
}

export function QRCodeModal({
	open,
	onClose,
	onSelect,
	children,
}: QRCodeModalProps) {
	const [search, setSearch] = useState("");

	const filteredBanks = BANKS.filter(
		(bank) =>
			bank.name.toLowerCase().includes(search.toLowerCase()) ||
			bank.country.toLowerCase().includes(search.toLowerCase()),
	);

	if (!open) return null;

	return (
		<Dialog open={open} onOpenChange={(open: boolean) => {
      if (!open) {
        onClose()
      }
		}}>
    <DialogTrigger>{children}</DialogTrigger>
	    <DialogContent className="overflow-hidden">
        <div className="flex flex-col items-start justify-start gap-3">
				</div>
			</DialogContent>
		</Dialog>
	);
}
