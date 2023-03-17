import type { ProtocolWithReturn } from 'webext-bridge'
import { SSASY_MESSAGE } from '~/logic'
import type { SsasyMessage } from '~/logic'

declare module 'webext-bridge' {
  export interface ProtocolMap {
    // define message protocol types
    // see https://github.com/antfu/webext-bridge#type-safe-protocols
    [SSASY_MESSAGE.REQUEST_PUBLIC_KEY]: ProtocolWithReturn<SsasyMessage, SsasyMessage>
  }
}
