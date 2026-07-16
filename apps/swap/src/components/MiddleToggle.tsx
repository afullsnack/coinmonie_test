import { ArrowUpDownIcon } from "lucide-react";
import { Button } from "./ui/button";


export function MiddleToggle() {
  return (
    <div className="flex justify-center absolute z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <Button
        variant="secondary"
        size="icon-lg"
				onClick={() => {
				}}
				className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
			>
				<ArrowUpDownIcon className="w-5 h-5 text-black" />
			</Button>
		</div>
  )
}
