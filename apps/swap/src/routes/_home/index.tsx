import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowUpDownIcon,
	SettingsIcon,
	ChevronDownIcon,
	ArrowRightIcon,
	Loader2Icon,
	HistoryIcon,
  ChevronDown,
} from "lucide-react";
import { TokenSelectorModal } from "@/components/token-selector-modal";
import { BankSelectorModal } from "@/components/bank-selector-modal";
import {
	TOKENS,
	FIAT_CURRENCIES,
	BANKS,
	type Token,
	type Bank,
} from "@/data/constants";
import { Input } from "#/components/ui/input";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";
import { MiddleToggle } from "#/components/MiddleToggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import { InputGroup, InputGroupAddon, InputGroupInput } from "#/components/ui/input-group";

export const Route = createFileRoute("/_home/")({ component: Home });

const defaultInputStyle = `outline-0 focus-visible:ring-0 p-2 focus:bg-transparent dark:bg-transparent h-auto`

function Home() {
	const [sendToken, setSendToken] = useState<Token | null>(null);
	const [receiveCurrency, setReceiveCurrency] = useState<{
    id: string;
    symbol: string;
    name: string;
    rate: number;
	} | null>(null);
	const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
	const [sendAmount, setSendAmount] = useState("");
	const [receiveAmount, setReceiveAmount] = useState("");
	const [accountNumber, setAccountNumber] = useState("");
	const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
	const [isBankModalOpen, setIsBankModalOpen] = useState(false);
	const [isFindingQuote, setIsFindingQuote] = useState(false);

	const handleSendAmountChange = (value: string) => {
		setSendAmount(value);
		if (value && !Number.isNaN(Number.parseFloat(value))) {
			const amount = Number.parseFloat(value);
			const received = amount * receiveCurrency.rate;
			setReceiveAmount(received.toLocaleString("en-US", {
				maximumFractionDigits: 2,
			}));
		} else {
			setReceiveAmount("");
		}
	};

	const handleSwap = () => {
		if (!sendAmount || !selectedBank || !accountNumber) return;
		setIsFindingQuote(true);
		setTimeout(() => {
			setIsFindingQuote(false);
		}, 2000);
  };

  const SendComponent = () => (
    <div className="bg-muted/10 rounded-2xl p-4 flex gap-3 items-center justify-between">
								<div className="grid items-center justify-start gap-3">
									<span className="text-gray-400 text-sm">
										You'll send
               </span>
               <Input
										type="number"
										placeholder="0.00"
										value={sendAmount}
										onChange={(e) =>
     									handleSendAmountChange(e.target.value)
										}
										className={cn(defaultInputStyle, "md:text-4xl text-6xl border-none max-w-xs h-20 bg-transparent text-white font-semibold placeholder-gray-600 focus-visible:border-none focus:outline-none text-left [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none outline-none")}
									/>
									<span className="text-gray-500 text-xs">
									${sendAmount || "0.00"}
									</span>
								</div>
								<div className="flex items-center gap-3">
									<Button
										onClick={() => setIsTokenModalOpen(true)}
										className="flex items-center gap-2 rounded-xl px-4 py-3"
             >
               {!sendToken && <span>Choose token</span>}
               {sendToken
                 && (<>
                    <div
											className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
											style={{
												backgroundColor: sendToken.logoColor,
											}}
										>
											{sendToken?.symbol.slice(0, 2)}
										</div>
										<span className="text-white font-medium">
											{sendToken.symbol}
                    </span>
                  </>)}
										<ChevronDownIcon className="w-4 h-4 text-gray-400" />
									</Button>
								</div>
							</div>
	)

  const ReceiveComponent = () => (
    <div className="bg-muted/10 rounded-2xl p-4 flex gap-3 items-center justify-between">
			<div className="grid items-center justify-start gap-3">
				<span className="text-gray-400 text-sm">
					You'll receive
      </span>
      <Input
					type="number"
					placeholder="0.00"
					value={sendAmount}
					onChange={(e) =>
				handleSendAmountChange(e.target.value)
					}
					className={cn(defaultInputStyle, "md:text-4xl text-6xl border-none max-w-xs h-20 bg-transparent text-white font-semibold placeholder-gray-600 focus-visible:border-none focus:outline-none text-left [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none outline-none")}
				/>
				<span className="text-gray-500 text-xs">
				${receiveAmount || "0.00"}
				</span>
			</div>
			<div className="flex items-center gap-3">
				<Button
					onClick={() => setIsTokenModalOpen(true)}
					className="flex items-center gap-2 rounded-xl px-4 py-3"
    >
      {!receiveCurrency && <span>Choose token</span>}
      {receiveCurrency && (<>
        <div
						className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
					>
						{receiveCurrency?.symbol.slice(0, 2)}
					</div>
					<span className="text-white font-medium">
						{receiveCurrency.symbol}
        </span>
      </>)}
					<ChevronDownIcon className="w-4 h-4 text-gray-400" />
				</Button>
			</div>
		</div>
  )

  const FiatDestination = () => (
    <InputGroup className="h-[55px] border border-input/30">
      <InputGroupAddon align="inline-start">
        <Button onClick={() => setIsBankModalOpen(true)} className="flex items-center">Choose bank <ChevronDown className="size-4" /></Button>
      </InputGroupAddon>
      <InputGroupInput
				type="number"
				onChange={(e) =>
  				console.log(e.target.value)
				}
				className={cn(defaultInputStyle, "border-l border-l-secondary/30 text-secondary px-4 flex-1 md:text-xl max-w-xs h-auto bg-transparent font-semibold focus:outline-none text-left [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none outline-none")}
			/>
    </InputGroup>
  )

  return (
    <>
			<div className="w-full max-w-full">
        <div className="grid gap-2 rounded-3xl p-2 shadow-2xl overflow-hidden bg-primary">
          <div className="relative grid gap-1">
            <SendComponent />
            <MiddleToggle />
            <ReceiveComponent />
          </div>

          <FiatDestination />
        </div>

				<Button
          onClick={handleSwap}
          size="lg"
          variant="secondary"
					disabled={
						!sendAmount ||
						!selectedBank ||
						!accountNumber ||
						isFindingQuote
					}
					className="w-full max-h-18 h-full text-black font-semibold rounded-xl py-4 flex items-center justify-center gap-2"
				>
  				Choose asset to send
				</Button>
			</div>


			<TokenSelectorModal
				open={isTokenModalOpen}
				onClose={() => setIsTokenModalOpen(false)}
				onSelect={setSendToken}
			/>

			<BankSelectorModal
				open={isBankModalOpen}
				onClose={() => setIsBankModalOpen(false)}
				onSelect={setSelectedBank}
			/>
    </>
	);
}
