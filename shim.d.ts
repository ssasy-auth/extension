import type { ProtocolWithReturn } from 'webext-bridge'
import { SSASY_MESSAGE } from '~/common/utils'
import type { SsasyMessage } from '~/common/utils'

declare module 'webext-bridge' {
  export interface ProtocolMap {
    // define message protocol types
    // see https://github.com/antfu/webext-bridge#type-safe-protocols
    [SSASY_MESSAGE.REQUEST_PUBLIC_KEY]: ProtocolWithReturn<SsasyMessage, SsasyMessage>
  }
}
