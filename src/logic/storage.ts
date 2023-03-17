import { RemovableRef } from '@vueuse/core'
import { useStorageLocal } from '~/composables/useStorageLocal'

type StorageItem = string | undefined

export const PRIVATE_KEY_CIPHERTEXT: RemovableRef<StorageItem> = useStorageLocal('ssasy-private-key', undefined)
export const SESSION: RemovableRef<StorageItem> = useStorageLocal('ssasy-session', undefined)
export const MessageSession: RemovableRef<StorageItem> = useStorageLocal('ssasy-message-session', undefined)

interface ExtensionStorage {
  get: () => StorageItem
  set: (value: StorageItem) => void
}

export const LocalStorage = {
  Session: {
    get: () => SESSION.value,
    set: (value: StorageItem) => SESSION.value = value
  } as ExtensionStorage,
  PrivateKeyCiphertext: {
    get: () => PRIVATE_KEY_CIPHERTEXT.value,
    set: (value: StorageItem) => PRIVATE_KEY_CIPHERTEXT.value = value
  } as ExtensionStorage,
  MessageSession: {
    get: () => MessageSession.value,
    set: (value: StorageItem) => MessageSession.value = value
  } as ExtensionStorage
}