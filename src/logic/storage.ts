import { RemovableRef } from '@vueuse/core'
import { useStorageLocal } from '~/composables/useStorageLocal'

export const VaultStorage: RemovableRef<string|undefined> = useStorageLocal('ssasy-vault-key', undefined)
