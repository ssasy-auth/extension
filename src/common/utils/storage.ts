import { useStorageLocal } from '~/composables/useStorageLocal'

const STORAGE_KEY_EXT_AUTH = 'ext-auth'
const STORAGE_KEY_EXT_SESSION = 'ext-session'
const STORAGE_KEY_EXT_SETTING = 'ext-setting'

export const StorageUtil = {
  Auth: useStorageLocal(STORAGE_KEY_EXT_AUTH, undefined),
  Session: useStorageLocal(STORAGE_KEY_EXT_SESSION, undefined),
  Setting: useStorageLocal(STORAGE_KEY_EXT_SETTING, undefined)
}