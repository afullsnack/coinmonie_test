import { useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { BANKS, type Bank } from "@/data/constants";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "./ui/item";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

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
		<Dialog open={open} onOpenChange={(open: boolean) => {
		      if (!open) {
		        onClose()
		      }
		}}>
    <DialogTrigger>Open</DialogTrigger>
	    <DialogContent className="overflow-hidden">
	        <div className="flex flex-col items-start justify-start gap-3">
	          <DialogHeader>
	            <DialogTitle>Choose a bank</DialogTitle>
	            <DialogDescription>Select option from list or search</DialogDescription>
	          </DialogHeader>
	          <InputGroup>
	            <InputGroupInput placeholder="Search bank" />
	            <InputGroupAddon>
	              <SearchIcon />
	            </InputGroupAddon>
	          </InputGroup>
	          <ItemGroup className="w-full max-h-[60dvh] overflow-y-auto gap-2">
	            {BANKS.map((bank, index) => (
	              <Item key={bank.id} variant="outline" className="bg-secondary!">
	                <ItemMedia>
	                  <Avatar>
	                    <AvatarImage src={bank.url}/>
	                    <AvatarFallback>{bank.logoInitial.charAt(0)}</AvatarFallback>
	                  </Avatar>
	                </ItemMedia>
	                <ItemContent className="gap-1">
	                  <ItemTitle>{bank.name}</ItemTitle>
	                </ItemContent>
	              </Item>
	            ))}
	          </ItemGroup>
						</div>
			</DialogContent>
		</Dialog>
	);
}
