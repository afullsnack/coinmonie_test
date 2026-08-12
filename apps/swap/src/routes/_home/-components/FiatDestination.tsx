import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar';
import { Button } from '#/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '#/components/ui/input-group'
import { cn, defaultInputStyle } from '#/lib/utils';
import { ChevronDown, Loader2 } from 'lucide-react';

const FiatDestination = ({
	setIsBankModalOpen,
	selectedbank,
	accountNumber,
	onAccountNumberChange,
	accountName,
	isFetching,
	fiat,
	disabled,
}: any) => {
	const needsBank = Boolean(accountNumber) && !selectedbank

	return (
		<>
    <InputGroup className={cn("h-[55px] border border-input/10 rounded-xl!", { "opacity-50 pointer-events-none": disabled })}>
      <InputGroupAddon align="inline-start">
				<Button
					size="xs"
          onClick={() => setIsBankModalOpen(true)}
					disabled={disabled}
					className={cn("flex items-center text-xs md:text-sm bg-accent p-2! h-auto rounded-xl", {
						"animate-pulse shadow-[0_0_0_3px_var(--color-accent)] shadow-accent/40": needsBank,
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
						{selectedbank && fiat && <span className='max-w-30 line-clamp-2 text-ellipsis'>{selectedbank?.name}</span>}
						{!selectedbank && fiat && <span className='max-w-30 line-clamp-2 text-ellipsis'>{fiat.country === "NG"? 'Choose bank' : 'Choose carrier'}</span>}
						{' '}
          <ChevronDown className="size-4" />
        </Button>
      </InputGroupAddon>
      <InputGroupInput
        type="text"
        inputMode="numeric"
        value={accountNumber}
				onChange={(e) => onAccountNumberChange(e.target.value.replace(/\D/g, '').slice(0, fiat?.mobileLength ?? 10))}
				placeholder={fiat?.country === "NG"? 'Account number' : 'Mobile number'}
				disabled={disabled}
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
