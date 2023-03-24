import type { RemovableRef } from '@vueuse/core'
import { useStorageLocal } from '~/composables/useStorageLocal'

type StorageItem = string | undefined

interface ExtensionStorage {
  get: () => StorageItem
  set: (value: StorageItem) => void
}

const KEY_PRIVATE_ENCRYPTED: RemovableRef<StorageItem> = useStorageLocal('encrypted-private-key', undefined)
const KEY_PUBLIC_PLAINTEXT: RemovableRef<StorageItem> = useStorageLocal('plaintext-public-key', undefined)

export const LocalStorage = {
  KeyPrivateEncryptedString: {
    get: () => KEY_PRIVATE_ENCRYPTED.value,
    set: (value: StorageItem) => KEY_PRIVATE_ENCRYPTED.value = value
  } as ExtensionStorage,
  KeyPublicPlaintextString: {
    get: () => KEY_PUBLIC_PLAINTEXT.value,
    set: (value: StorageItem) => KEY_PUBLIC_PLAINTEXT.value = value
  } as ExtensionStorage
}