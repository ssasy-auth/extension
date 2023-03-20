import type { RemovableRef } from '@vueuse/core'
import { useStorageLocal } from '~/composables/useStorageLocal'

type StorageItem = string | undefined

interface ExtensionStorage {
  get: () => StorageItem
  set: (value: StorageItem) => void
}

const ENCRYPTED_PRIVATE_KEY: RemovableRef<StorageItem> = useStorageLocal('encrypted-private-key', undefined)
const PLAINTEXT_PUBLIC_KEY: RemovableRef<StorageItem> = useStorageLocal('plaintext-public-key', undefined)

export const LocalStorage = {
  EncryptedPrivateKeyString: {
    get: () => ENCRYPTED_PRIVATE_KEY.value,
    set: (value: StorageItem) => ENCRYPTED_PRIVATE_KEY.value = value
  } as ExtensionStorage,
  PlaintextPublicKeyString: {
    get: () => PLAINTEXT_PUBLIC_KEY.value,
    set: (value: StorageItem) => PLAINTEXT_PUBLIC_KEY.value = value
  } as ExtensionStorage
}