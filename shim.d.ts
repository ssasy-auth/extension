import type { ProtocolWithReturn } from 'webext-bridge'
import { MessageType } from '~/common/logic'
import type { KeyRequest, PublicKeyResponse, ChallengeRequest, ChallengeResponse, ErrorResponse } from '~/common/logic'

declare module 'webext-bridge' {
  
  // define message protocol types below (see https://github.com/antfu/webext-bridge#type-safe-protocols)
  export interface ProtocolMap {
    'close-request-tab': ErrorResponse | undefined
    [MessageType.REQUEST_PUBLIC_KEY]: ProtocolWithReturn<KeyRequest, PublicKeyResponse | ErrorResponse>
    [MessageType.REQUEST_SOLUTION]: ProtocolWithReturn<ChallengeRequest, ChallengeResponse | ErrorResponse>
  }
}
