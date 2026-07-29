import { useSyncExternalStore } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { dismissErrorDialog, getErrorDialogState, subscribeErrorDialog } from '#/lib/error-dialog-store'

export function ErrorDialog() {
  const state = useSyncExternalStore(subscribeErrorDialog, getErrorDialogState, () => null)

  return (
    <Dialog open={Boolean(state)} onOpenChange={(open) => !open && dismissErrorDialog()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="sr-only">Error</DialogTitle>
          <DialogDescription className="text-center text-foreground">{state?.description}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
