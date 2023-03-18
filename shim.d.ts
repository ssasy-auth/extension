import type { ProtocolWithReturn } from 'webext-bridge'
import { ExtensionMessage } from '~/common/logic'
import type { SsasyMessage } from '~/common/logic'

declare module 'webext-bridge' {
  export interface ProtocolMap {
    // define message protocol types
    // see https://github.com/antfu/webext-bridge#type-safe-protocols
    [ExtensionMessage.RequestPublicKey]: ProtocolWithReturn<SsasyMessage, SsasyMessage>
  }
}
