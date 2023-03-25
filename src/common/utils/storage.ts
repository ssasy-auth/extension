import type { RemovableRef } from '@vueuse/core'
import { useStorageLocal } from '~/composables/useStorageLocal'

interface ExtensionStorage {
  get: () => string | undefined
  set: (value: string | undefined) => void
}

const KEY_PRIVATE_ENCRYPTED: RemovableRef<string | undefined> = useStorageLocal('key-private-encrypted', undefined)
const KEY_PUBLIC_PLAINTEXT: RemovableRef<string | undefined> = useStorageLocal('key-public-plaintext', undefined)

const SETTING_REQUIRE_SIGNATURE: RemovableRef<string | undefined> = useStorageLocal('setting-require-signature', undefined)
const SETTING_DARK_MODE: RemovableRef<string | undefined> = useStorageLocal('setting-dark-mode', undefined)

export const LocalStorage = {
  KeyPrivateEncryptedString: {
    get: () => KEY_PRIVATE_ENCRYPTED.value,
    set: (value) => KEY_PRIVATE_ENCRYPTED.value = value
  } as ExtensionStorage,
  KeyPublicPlaintextString: {
    get: () => KEY_PUBLIC_PLAINTEXT.value,
    set: (value) => KEY_PUBLIC_PLAINTEXT.value = value
  } as ExtensionStorage,
  SettingRequireSignature: {
    get: () => SETTING_REQUIRE_SIGNATURE.value,
    set: (value) => SETTING_REQUIRE_SIGNATURE.value = value
  } as ExtensionStorage,
  SettingDarkMode: {
    get: () => SETTING_DARK_MODE.value,
    set: (value) => SETTING_DARK_MODE.value = value
  } as ExtensionStorage
}