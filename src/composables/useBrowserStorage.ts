import { storage } from 'webextension-polyfill'

enum StorageEnum {
  VAULT = 'store-vault',
  SESSION = 'store-session',
  SETTING = 'store-setting'
}

type StorageKey = keyof typeof StorageEnum

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

interface SerializerMachine {
  /**
   * Converts a value to a string for storage
   * 
   * @param value - value to be serialized
   */
  write(value: any): string;

  /**
   * Converts a string to its original type when read from storage
   * 
   * @param value - value to be deserialized
   */
  read(value: string): any;
}

interface StorageMachine {
  set(key: string, value: any): void;
  get(key: string): Promise<any>;
  remove(key: string): void;
}

/**
 * converts a value to a string for storage and then back to the original type when read
 */
const Serializer: SerializerMachine = {
  write(value: any): string {
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

    return JSON.stringify(storageItem);
  },
  
  read(value: string): any {
    if(value === undefined || value === null){
      return undefined;
    }
  
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
}

/**
 * a wrapper around browser.storage.local that uses the serializer
 */
const LocalStorage: StorageMachine = {
  remove(key) {
    return storage.local.remove(key)
  },

  set(key, value) {
    const v = Serializer.write(value);
    return storage.local.set({ [key]: v })
  },

  async get(key) {
    const result = await storage.local.get(key);
    const value = result[key];

    return Serializer.read(value)
  }
}

const useBrowserStorage = (key: StorageKey) => {
  const storageKey = StorageEnum[key];

  return {
    get: async () => {
      return await LocalStorage.get(storageKey);
    },
    set: (value: any) => {
      return LocalStorage.set(storageKey, value);
    },
    remove: () => {
      return LocalStorage.remove(storageKey);
    }
  }
}

export {
  StorageEnum,
  useBrowserStorage
}