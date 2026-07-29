import { useEffect, useState } from 'react'
import { Check, SearchIcon } from 'lucide-react'
import type { Bank, Fiat } from '@/data/constants'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from './ui/item'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { useQuery } from '@tanstack/react-query'
import { bankListQueryOptions } from '#/lib/api-client'

interface BankSelectorModalProps {
  open: boolean
  onClose: () => void
  onSelect: (bank: Bank) => void
	selectedBank: Bank | null
  fiat: Fiat
}

export function BankSelectorModal({
  open,
  onClose,
  onSelect,
	selectedBank,
  fiat,
}: BankSelectorModalProps) {
  const [search, setSearch] = useState('')
  const bankList = useQuery(bankListQueryOptions(fiat.country))

  const filteredBanks = bankList.data.filter(
    (bank) =>
      bank.name.toLowerCase().includes(search.toLowerCase()) ||
      bank.code.toLowerCase().includes(search.toLowerCase()),
  )

	useEffect(() => {
		if (!open) {
			setSearch('')
		}
	}, [open])

  if (!open) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(openVal: boolean) => {
        if (!openVal) {
          onClose()
        }
      }}
    >
      <DialogContent className="overflow-hidden">
        <div className="flex flex-col items-start justify-start gap-3">
          <DialogHeader>
            <DialogTitle className="text-left text-2xl lg:text-lg">{(fiat.country === "NG")? 'Choose a bank' : 'Choose a carier'}</DialogTitle>
            <DialogDescription>
              Select option from list or search
            </DialogDescription>
          </DialogHeader>
          <InputGroup>
            <InputGroupInput placeholder={(fiat.country === "NG")? "Search bank" : "Search carier"} onChange={(e) => setSearch(e.target.value)} />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
          <ItemGroup
            className="w-full max-h-[60dvh] overflow-y-auto gap-2"
          >
            {filteredBanks.map((bank, index) => (
              <Item
                key={`${bank.id}-${index}-${bank.code}`}
                variant="outline"
                className="bg-muted"
                onClick={() => {
                  console.log(`Bank list item cliked`, { bank })
                  onSelect(bank)
                  onClose()
                }}
              >
                <ItemMedia>
                  <Avatar>
                    <AvatarImage src={bank.logo} />
                    <AvatarFallback className="bg-secondary">
                      {bank.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent className="gap-1">
                  <ItemTitle>{bank.name}</ItemTitle>
                </ItemContent>
                {selectedBank?.id === bank.id && (
                  <ItemActions className='flex-1 justify-end'>
                    <Button
                      variant="default"
                      size="icon-sm"
                      className="bg-accent rounded-full"
                    >
                      <Check />
                    </Button>
                  </ItemActions>
                )}
              </Item>
            ))}
          </ItemGroup>
        </div>
      </DialogContent>
    </Dialog>
  )
}
