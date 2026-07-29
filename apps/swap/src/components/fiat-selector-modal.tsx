import { useEffect, useState } from 'react'
import { Check, SearchIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LOCAL } from '@/data/constants'
import type { Fiat } from '@/data/constants'
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
import { useMediaQuery } from '#/hooks/use-media-query'

interface FiatSelectorModalProps {
  open: boolean
  selectedFiat: Fiat | null
  onClose: () => void
  onFiatSelect: (fiat: Fiat) => void
  children?: React.ReactNode
}

export function FiatSelectorModal({
  open,
  selectedFiat,
  onClose,
  onFiatSelect,
}: FiatSelectorModalProps) {
  const [searchFiat, setSearchFiat] = useState('')
  // const isMobile = useMediaQuery('(max-width: 768px)')

  const filteredFiats = LOCAL.filter((fiat) => {
    const matchesSearch =
      fiat.name.toLowerCase().includes(searchFiat.toLowerCase()) ||
      fiat.currency.toLowerCase().includes(searchFiat.toLowerCase()) ||
      fiat.country.toLowerCase().includes(searchFiat.toLowerCase())
    return matchesSearch
  })

  useEffect(() => {
    if (!open) {
      setSearchFiat('')
    }
  }, [open])

  if (!open) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(open: boolean) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-left text-2xl lg:text-lg">
            Select local currency
          </DialogTitle>
          <DialogDescription className="text-left">
            Select option from list or search
          </DialogDescription>
          <InputGroup>
            <InputGroupInput
              placeholder="Search currency"
              onChange={(e) => setSearchFiat(e.target.value)}
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
        </DialogHeader>
        <div className="items-start justify-start w-full">
          <ItemGroup className="w-full flex flex-col gap-2 max-h-[55dvh] overflow-y-auto">
            {filteredFiats.map((fiat, index) => (
              <Item
                key={`${fiat.currency}-${index}-${fiat.country}`}
                variant="outline"
                className="bg-muted"
                onClick={() => {
                  onFiatSelect(fiat)
                  onClose()
                }}
              >
                <ItemMedia>
                  <Avatar>
                    <AvatarImage src={fiat.url} />
                    <AvatarFallback className="bg-secondary">
                      {fiat.currency.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent className="gap-1">
                  <ItemTitle>{fiat.currency}</ItemTitle>
                </ItemContent>
                {selectedFiat?.country === fiat.country && (
                  <ItemActions className="flex-1 justify-end">
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
