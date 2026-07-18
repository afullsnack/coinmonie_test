import { useState } from 'react'
import { Check, SearchIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { TOKENS, NETWORKS } from '@/data/constants'
import type {Token} from "@/data/constants"
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from './ui/item'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { useMediaQuery } from '#/hooks/use-media-query'
import { useQuery } from '@tanstack/react-query'
import { tokenQueryOptions } from '#/lib/api-client'

interface TokenSelectorModalProps {
  open: boolean
  onClose: () => void
  onSelect: (token: Token) => void
  children?: React.ReactNode
}

export function TokenSelectorModal({
  open,
  onClose,
  onSelect,
}: TokenSelectorModalProps) {
  const [search, setSearch] = useState('')
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null)
	const isMobile = useMediaQuery('(max-width: 768px)')

	const tokens = useQuery(tokenQueryOptions)

  const filteredTokens = TOKENS.filter((token) => {
    const matchesSearch =
      token.name.toLowerCase().includes(search.toLowerCase()) ||
      token.symbol.toLowerCase().includes(search.toLowerCase())
    const matchesNetwork = selectedNetwork
      ? token.network === selectedNetwork
      : true
    return matchesSearch && matchesNetwork
  })

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
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[70dvh] h-full p-0! overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 justify-start w-full">
          <div className="flex flex-col items-start justify-start gap-3 bg-muted py-4">
            <DialogHeader>
              <DialogTitle className="text-left">Select network</DialogTitle>
            </DialogHeader>
            <InputGroup>
              <InputGroupInput placeholder="Search network" />
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
            </InputGroup>
            <ItemGroup
              className="w-full overflow-auto gap-2 max-h-[60dvh]"
              orientation={isMobile ? 'horizontal' : 'vertical'}
            >
              {NETWORKS.map((network, index) => (
                <Item
                  key={network.id}
                  variant="outline"
                  className="bg-secondary! min-w-2xs sm:max-w-sm sm:w-full"
                >
                  <ItemMedia>
                    <Avatar>
                      <AvatarImage src={network?.url} />
                      <AvatarFallback>{network.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </ItemMedia>
                  <ItemContent className="gap-1">
                    <ItemTitle>{network.name}</ItemTitle>
                    <ItemDescription className="text-xs">
                      Blockchain network
                    </ItemDescription>
                  </ItemContent>
                  {index === 1 && (
                    <ItemActions>
                      <Button
                        variant="default"
                        size="icon-xs"
                        className="rounded-full"
                      >
                        <Check className='size-4' />
                      </Button>
                    </ItemActions>
                  )}
                </Item>
              ))}
            </ItemGroup>
          </div>
          <div className="md:col-span-2 w-full overflow-y-auto overflow-x-hidden flex flex-col items-start justify-start gap-3 p-4">
            <DialogHeader>
              <DialogTitle className="text-left">Choose a token</DialogTitle>
              <DialogDescription className="text-left">
                Select an option from the list or search for token
              </DialogDescription>
            </DialogHeader>
            <InputGroup>
              <InputGroupInput placeholder="Search by name, symbol or address" />
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
            </InputGroup>
            <ItemGroup
              className="w-full gap-2 max-h-[60dvh]"
              orientation="vertical"
            >
              {tokens.data && tokens.data.map((token, index) => (
                <Item
                  key={token.id}
                  variant="outline"
                  className="bg-secondary!"
                >
                  <ItemMedia>
                    <Avatar>
                      <AvatarImage src={token.image} />
                      <AvatarFallback>{token.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </ItemMedia>
                  <ItemContent className="gap-1">
                    <ItemTitle className="min-w-sm">{token.symbol.toUpperCase()}</ItemTitle>
                    <ItemDescription className="text-xs flex flex-col sm:flex-row sm:items-center justify-start">
                      {token.name}
                      <div className="size-1 rounded-full bg-amber-200 mx-2" />
                      {token.market_cap}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              ))}
            </ItemGroup>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
