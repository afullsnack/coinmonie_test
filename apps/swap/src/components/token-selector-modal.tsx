import { useEffect, useState } from 'react'
import { Check, SearchIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Asset, Network } from '@/data/constants'
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
import { assetListQueryOptions } from '#/lib/api-client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { cn } from '#/lib/utils'

interface TokenSelectorModalProps {
  open: boolean
  selectedNetwork: Network | null
  onClose: () => void
  onSelect: (token: Asset) => void
  onNetworkSelect: (network: Network) => void
  children?: React.ReactNode
	sendToken: Asset | null
}

export function TokenSelectorModal({
  open,
  selectedNetwork,
  onClose,
  onSelect,
  onNetworkSelect,
	sendToken,
}: TokenSelectorModalProps) {
  const [searchNetwork, setSearchNetwork] = useState('')
  const [searchToken, setSearchToken] = useState('')
  const assetList = useQuery(assetListQueryOptions)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const networks: Array<Network> = Object.values(
    assetList.data.reduce((acc, { blockchain }) => {
      const index = blockchain.id.toString()
      acc[index] = blockchain
      return acc
    }, {} as any),
  )

  const filteredNetworks = networks.filter((network) => {
    const matchesSearch = network.name
      .toLowerCase()
      .includes(searchNetwork.toLowerCase())
    return matchesSearch
  })
  const filteredTokens = assetList.data.filter((token) => {
    const matchesSearch =
      token.name.toLowerCase().includes(searchToken.toLowerCase()) ||
      token.code.toLowerCase().includes(searchToken.toLowerCase()) ||
      token.address.toLowerCase().includes(searchToken.toLowerCase())
    const matchesNetwork = selectedNetwork
      ? token.blockchain.id === selectedNetwork.id
      : true
    return matchesSearch && matchesNetwork
	})

  useEffect(() => {
		if (!open) {
			setSearchNetwork('')
			setSearchToken('')
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
      <DialogContent className="sm:max-w-4xl max-h-[75dvh] h-full p-0! overflow-hidden">
        <div className="grid grid-cols-1 grid-rows-[auto_1fr] md:grid-cols-3 items-start justify-start w-full h-full overflow-hidden">
          <div className="md:h-full flex flex-col items-start justify-start bg-muted overflow-hidden">
            <DialogHeader className="px-4 py-6 w-full">
              <DialogTitle className="text-left text-2xl lg:text-lg">
                Select network
              </DialogTitle>
              {!isMobile && (
                <InputGroup>
                  <InputGroupInput
                    value={searchNetwork}
                    onChange={(e) => setSearchNetwork(e.target.value)}
                    placeholder="Search network"
                  />
                  <InputGroupAddon>
                    <SearchIcon />
                  </InputGroupAddon>
                </InputGroup>
              )}
              {isMobile && (
                <Select
                  defaultValue={selectedNetwork?.id.toString()}
                  onValueChange={(id) => {
                    onNetworkSelect(
                      filteredNetworks.find((n) => n.id.toString() === id),
                    )
                  }}
                >
                  <SelectTrigger className="w-full h-auto max-h-12 border border-accent">
                    <SelectValue
                      placeholder="Select network"
                      className="max-w-lg w-full"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredNetworks.map((network, index) => (
                      <SelectItem
                        value={network.id.toString()}
                        key={`${network.id}-${index}`}
                      >
                        <Avatar className="size-4!">
                          <AvatarImage src={network.url} />
                          <AvatarFallback>
                            {network.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {network.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </DialogHeader>

            {!isMobile && (
              <ItemGroup className="grid flex-1! overflow-y-auto w-full p-4 gap-2">
                {filteredNetworks.map((network, index) => (
                  <Item
                    key={`${network.id}-${index}`}
										className={cn("bg-secondary!", {
											"border border-accent": selectedNetwork?.id === network.id
                    })}
                    size="sm"
                    onClick={() => onNetworkSelect(network)}
                  >
                    <ItemMedia>
                      <Avatar>
                        <AvatarImage src={network.url} />
                        <AvatarFallback>
                          {network.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </ItemMedia>
                    <ItemContent className="gap-1">
                      <ItemTitle>{network.name}</ItemTitle>
                      <ItemDescription className="text-xs">
                        Blockchain network
                      </ItemDescription>
                    </ItemContent>
                    {selectedNetwork?.id === network.id && (
                      <ItemActions className='flex-1 justify-end'>
                        <Button
                          variant="default"
                          size="icon-xs"
                          className="rounded-full bg-accent"
                        >
                          <Check className="size-4" />
                        </Button>
                      </ItemActions>
                    )}
                  </Item>
                ))}
              </ItemGroup>
            )}
          </div>
          <div className="md:col-span-2 h-full md:h-full w-full flex flex-col items-start justify-start overflow-hidden">
            <DialogHeader className='p-4 w-full'>
              <DialogTitle className="text-left  text-2xl lg:text-lg">
                Choose a token
              </DialogTitle>
              <DialogDescription className="text-left">
                Select an option from the list or search for token
              </DialogDescription>
	            <InputGroup className='bg-white!'>
	              <InputGroupInput
	                value={searchToken}
									onChange={(e) => setSearchToken(e.target.value)}
	                placeholder="Search by name, symbol or address"
	              />
	              <InputGroupAddon>
	                <SearchIcon />
	              </InputGroupAddon>
	            </InputGroup>
            </DialogHeader>
            <ItemGroup className="flex-1 w-full px-4 pb-4 gap-2 overflow-hidden overflow-y-auto">
              {filteredTokens.map((token) => (
                <Item
                  key={token.id}
                  size="sm"
                  variant="outline"
									className={cn("bg-muted flex flex-row items-start justify-start flex-nowrap my-2", {
										"border border-accent": sendToken && sendToken.id === token.id
                  })}
                  onClick={() => {
                    onSelect(token)
                    onClose()
                  }}
                >
                  <ItemMedia className="relative">
                    <Avatar>
                      <AvatarImage src={token.url} />
                      <AvatarFallback>{token.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Avatar className="absolute bottom-0 inset-e-0 size-4! bg-secondary border border-secondary">
                      <AvatarImage src={token.blockchain.url} />
                      <AvatarFallback>
                        {token.blockchain.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </ItemMedia>
                  <ItemContent className="flex-0! max-w-xs!">
                    <ItemTitle className="min-w-sm">
                      {token.code.toUpperCase()}
                    </ItemTitle>
                    <ItemDescription className="text-xs font-semibold! line-clamp-1! text-ellipsis! w-full flex items-center sm:items-center justify-start">
											{token.blockchain.name} — {token.address.slice(0, 6)}...{token.address.slice(-6)}
                    </ItemDescription>
                  </ItemContent>
                  {sendToken && sendToken.id === token.id && (
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
