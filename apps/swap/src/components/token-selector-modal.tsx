import { useState } from "react";
import { PlusIcon, SearchIcon, XIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TOKENS, NETWORKS, type Token } from "@/data/constants";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "./ui/item";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

interface TokenSelectorModalProps {
	open: boolean;
	onClose: () => void;
  onSelect: (token: Token) => void;
  children?: React.ReactNode;
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
    <Dialog open={open} onOpenChange={(open: boolean) => {
      if (!open) {
        onClose()
      }
		}}>
    <DialogTrigger>Open</DialogTrigger>
    <DialogContent className="sm:max-w-4xl p-0! overflow-hidden">
      <div className="grid grid-cols-3 justify-start w-full">
        <div className="flex flex-col items-start justify-start gap-3 bg-muted p-4">
          <DialogHeader>
            <DialogTitle>Select network</DialogTitle>
          </DialogHeader>
          <InputGroup>
            <InputGroupInput placeholder="Search network" />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
          <ItemGroup className="w-full overflow-y-auto gap-2 max-h-[60dvh]">
            {NETWORKS.map((network, index) => (
              <Item key={network.id} variant="outline" className="bg-secondary!">
                <ItemMedia>
                  <Avatar>
                    <AvatarImage src={network.url}/>
                    <AvatarFallback>{network.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent className="gap-1">
                  <ItemTitle>{network.name}</ItemTitle>
                  <ItemDescription className="text-xs">Blockchain network</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <PlusIcon />
                  </Button>
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        </div>
        <div className="col-span-2 flex flex-col items-start justify-start gap-3 p-4">
          <DialogHeader>
            <DialogTitle>Choose a token</DialogTitle>
            <DialogDescription>
              Select an option from the list or search for token
            </DialogDescription>
					</DialogHeader>
					<InputGroup>
            <InputGroupInput placeholder="Search by name, symbol or address" />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
						</InputGroup>
						<ItemGroup className="w-full overflow-y-auto gap-2 max-h-[60dvh]">
            {TOKENS.map((token, index) => (
              <Item key={token.id} variant="outline" className="bg-secondary!">
                <ItemMedia>
                  <Avatar>
                    <AvatarImage src={token.url}/>
                    <AvatarFallback>{token.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent className="gap-1">
                  <ItemTitle>{token.symbol}</ItemTitle>
									<ItemDescription className="text-xs">{token.name}.{token.address}</ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        </div>
      </div>
    </DialogContent>
	</Dialog>
	);
}
