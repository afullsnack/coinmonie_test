import type { BetterAuthClientPlugin } from 'better-auth/client'

import type { pin } from './pin'

export const pinClient = () =>
  ({
    id: 'pin',
    $InferServerPlugin: {} as ReturnType<typeof pin>,
    pathMethods: { '/pin/status': 'GET' },
  }) satisfies BetterAuthClientPlugin
