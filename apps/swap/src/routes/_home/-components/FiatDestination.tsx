import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar';
import { Button } from '#/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '#/components/ui/input-group'
import { cn, defaultInputStyle } from '#/lib/utils';
import { ChevronDown, Loader2 } from 'lucide-react';
// import { useState } from 'react';

const FiatDestination = ({
	setIsBankModalOpen,
	selectedbank,
	accountNumber,
	onAccountNumberChange,
	accountName,
	isFetching,
	fiat,
}: any) => {
	// const [bankEntry, setBankEntry] = useState<unknown[] | null>(null)

	return (
		<>
    <InputGroup className="h-[55px] border border-input/10 rounded-xl!">
      <InputGroupAddon align="inline-start">
				<Button
					size="xs"
          onClick={() => setIsBankModalOpen(true)}
					className={cn("flex items-center text-xs md:text-sm bg-accent p-2! h-auto rounded-lg", {
						// "": typeof selectedbank !== "undefined"
          })}
				>
					{selectedbank && (
						<Avatar size='sm'>
              <AvatarImage src={selectedbank.logo} className='m-0!' />
              <AvatarFallback className="bg-secondary">
                {selectedbank.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
					)}
						{selectedbank && fiat && <span className='max-w-[120px] line-clamp-2 text-ellipsis'>{selectedbank?.name}</span>}
						{!selectedbank && fiat && <span className='max-w-[120px] line-clamp-2 text-ellipsis'>{fiat.country === "NG"? 'Choose bank' : 'Choose carier'}</span>}
						{' '}
          <ChevronDown className="size-4" />
        </Button>
      </InputGroupAddon>
      <InputGroupInput
        type="number"
        value={accountNumber}
				onChange={(e) => onAccountNumberChange(e.target.value)}
				placeholder={fiat?.country === "NG"? 'Account number' : 'Mobile number'}
				max={10}
				maxLength={10}
        className={cn(
          defaultInputStyle,
          'text-primary px-4 flex-1 md:text-xl max-w-xs h-auto bg-transparent placeholder:text-gray-400 placeholder:text-sm font-semibold focus:outline-none text-left [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none outline-none selection:bg-accent selection:text-secondary',
        )}
      />
			</InputGroup>
			<div className='flex items-center justify-start gap-2'>{isFetching
				? (<>
						<Loader2 className='animate-spin size-4' />
						<span>Getting account name...</span>
					</>)
				: (<span>{accountName}</span>)}
			</div>
		</>
  )
}

export default FiatDestination;
