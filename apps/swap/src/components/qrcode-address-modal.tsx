import { Dialog, DialogContent } from './ui/dialog'
import { QRCode } from 'react-qr-code'
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group'
import CopyButton from './ui/copy-button'
import { Alert, AlertDescription } from './ui/alert'
import { BadgeInfoIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from './ui/avatar'
import { useQuery } from '@tanstack/react-query'
import { assetListQueryOptions } from '#/lib/api-client'
import type { Network } from '#/data/constants'

interface QrCodeModalProps {
  open: boolean
  onClose: () => void
  address: string
}

export function QrCodeModal({ open, onClose, address }: QrCodeModalProps) {
	if (!open) return null
	const assetList = useQuery(assetListQueryOptions)

  const networks: Array<Network> = Object.values(
    assetList.data.reduce((acc, { blockchain }) => {
      const index = blockchain.id.toString()
      acc[index] = blockchain
      return acc
    }, {} as any),
  )

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
				<div className="w-full flex flex-col items-center justify-start gap-3 mt-5">
					<div className='relative'>
						<img src={'/coinmonie_icon.png'} className='z-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-center object-contain size-14 bg-white rounded-full' />
	          <QRCode value={address} size={265} className="rounded-lg shadow-xl" />
					</div>
          <InputGroup>
            <InputGroupInput value={address} disabled contentEditable={false} />
            <InputGroupAddon align="inline-end">
              <CopyButton content={address} size="icon-sm" variant="ghost" />
            </InputGroupAddon>
          </InputGroup>
          <Alert className="bg-accent text-white">
            <BadgeInfoIcon />
            <AlertDescription className='text-secondary'>
              Any token sent will be swapped to specified asset and recipient.
            </AlertDescription>
					</Alert>
          <TokenGroup networks={networks} />
        </div>
      </DialogContent>
    </Dialog>
  )
}


const TokenGroup = ({networks}: {networks: Network[]}) => (
	<AvatarGroup className="grayscale hover:grayscale-0">
		{networks.slice(0, 4).map((network) => (
	    <Avatar>
	      <AvatarImage src={network.url} alt={network.name} />
				<AvatarFallback>{network.name.charAt(0)}{network.name.charAt(1)}</AvatarFallback>
	    </Avatar>

		))}
		<AvatarGroupCount>+{networks.length-4}</AvatarGroupCount>
  </AvatarGroup>
)
