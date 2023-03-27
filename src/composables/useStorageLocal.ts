import { storage } from 'webextension-polyfill'
import type {
  MaybeRef,
  RemovableRef,
  StorageLikeAsync,
  UseStorageAsyncOptions,
  SerializerAsync
} from '@vueuse/core'
import {
  useStorageAsync
} from '@vueuse/core'

const storageLocal: StorageLikeAsync = {
  removeItem(key: string) {
    return storage.local.remove(key)
  },

  setItem(key: string, value: string) {
    return storage.local.set({ [key]: value })
  },

  async getItem(key: string) {
    const result = await storage.local.get(key);
    const value = result[key];

    return value;
  }
}

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
 */
const serializer: SerializerAsync<any> = {
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

export const useStorageLocal = <T>(
  key: string,
  initialValue: MaybeRef<any>,
  options: UseStorageAsyncOptions<T> = { serializer }
): RemovableRef<any> => useStorageAsync(key, initialValue, storageLocal, options)
