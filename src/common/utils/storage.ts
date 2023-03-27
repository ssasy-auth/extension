import type { RemovableRef } from '@vueuse/core'
import { useStorageLocal } from '~/composables/useStorageLocal'

const STORAGE_KEY_EXT_AUTH = 'ext-auth'
const STORAGE_KEY_EXT_SESSION = 'ext-session'
const STORAGE_KEY_EXT_SETTING = 'ext-setting'

/**
 * Stores the private key encrypted with the password.
 */
const EXT_AUTH: RemovableRef<string | undefined> = useStorageLocal(STORAGE_KEY_EXT_AUTH, undefined)
/**
 * Stores the session token.
 */
const EXT_SESSION: RemovableRef<string | undefined> = useStorageLocal(STORAGE_KEY_EXT_SESSION, undefined)
/**
 * Stores the system settings
 */
const EXT_SETTING: RemovableRef<string | undefined> = useStorageLocal(STORAGE_KEY_EXT_SETTING, undefined)


interface StorageItem {
  /**
   * Type of the item
   */
  type: 'string' | 'number' | 'boolean' | 'object' | 'undefined';
  /**
   * Value of the item
   */
  value: any;
}

/**
 * Stores the value of an item.
 * 
 * @param key - item reference
 * @param value - item value
 */
function setStoredItem(key: RemovableRef<string | undefined>, value: any | undefined): void {
  let storageItem: StorageItem | undefined = undefined;

  if(typeof value === 'string'){
    storageItem = {
      type: 'string',
      value: value
    };
  }

  else if(typeof value === 'number'){
    storageItem = {
      type: 'number',
      value: value
    };
  }

  else if(typeof value === 'boolean'){
    storageItem = {
      type: 'boolean',
      value: value
    };
  }

  else if(typeof value === 'object'){
    storageItem = {
      type: 'object',
      value: JSON.stringify(value)
    };
  }

  else {
    storageItem = {
      type: 'undefined',
      value: undefined
    };
  }

  key.value = JSON.stringify(storageItem);
}

/**
 * Returns the value of a stored item. If it is undefined-ish, it returns undefined.
 * 
 * @param key - item reference
 * @returns value
 */
function getStoredItem(key: RemovableRef<string | undefined>): any | undefined {
  if(!key.value){
    return undefined;
  }
  
  const value: string = key.value;
  let storageItem: StorageItem | undefined;

  try {
    storageItem = JSON.parse(value);
  } catch (error) {
    return undefined;
  }

  if(!storageItem){
    return undefined;
  }

  else if (storageItem.type === 'string') {
    return storageItem.value as string;
  }

  else if (storageItem.type === 'number') {
    return Number(storageItem.value);
  }

  else if (storageItem.type === 'boolean') {
    return Boolean(storageItem.value);
  }

  else if (storageItem.type === 'object') {
    try {
      return JSON.parse(storageItem.value as string);
    } catch (error) {
      return undefined;
    }
  }

  else {
    return undefined;
  }
}

interface ExtensionStorage {
  get: () => any | undefined
  set: (value: any | undefined) => void
}

export const LocalStorage = {
  Auth: {
    get: () => getStoredItem(EXT_AUTH),
    set: (value) => setStoredItem(EXT_AUTH, value)
  } as ExtensionStorage,
  Session: {
    get: () => getStoredItem(EXT_SESSION),
    set: (value) => setStoredItem(EXT_SESSION, value)
  } as ExtensionStorage,
  Setting: {
    get: () => getStoredItem(EXT_SETTING),
    set: (value) => setStoredItem(EXT_SETTING, value)
  } as ExtensionStorage
}