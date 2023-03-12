import { RemovableRef } from '@vueuse/core'
import { useStorageLocal } from '~/composables/useStorageLocal'

export const KEY_STORAGE: RemovableRef<string|undefined> = useStorageLocal('ssasy-wallet-key', undefined)
export const SESSION_STORAGE: RemovableRef<string|undefined> = useStorageLocal('ssasy-session-key', undefined)
