import type { ProtocolWithReturn } from 'webext-bridge'
import { MessageType } from '~/bridge'
import type { KeyRequest, PublicKeyResponse, ChallengeRequest, ChallengeResponse, ErrorResponse } from '~/bridge'

declare module 'webext-bridge' {

  // define message protocol types below (see https://github.com/antfu/webext-bridge#type-safe-protocols)
  export interface ProtocolMap {
    'close-popup': ErrorResponse | undefined
    [MessageType.REQUEST_PUBLIC_KEY]: ProtocolWithReturn<KeyRequest, PublicKeyResponse | ErrorResponse>
    [MessageType.REQUEST_CHALLENGE_RESPONSE]: ProtocolWithReturn<ChallengeRequest, ChallengeResponse | ErrorResponse>
  }
}
