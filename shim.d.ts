import type { ProtocolWithReturn } from 'webext-bridge'
import { MessageType } from '~/common/logic'
import type { KeyRequest, KeyResponse, ChallengeRequest, ChallengeResponse } from '~/common/logic'

declare module 'webext-bridge' {
  export interface ProtocolMap {
    // define message protocol types
    // see https://github.com/antfu/webext-bridge#type-safe-protocols
    [MessageType.RequestPublicKey]: ProtocolWithReturn<KeyRequest, KeyResponse>
    [MessageType.RequestSolution]: ProtocolWithReturn<ChallengeRequest, ChallengeResponse>
  }
}
