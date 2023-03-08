import { defineStore } from 'pinia';
import { KeyModule, KeyChecker } from '@this-oliver/ssasy';
import type { GenericKey, PrivateKey, RawKey } from '@this-oliver/ssasy';

interface KeySmithStoreState {
  temporaryKey: PrivateKey | undefined;
}
export const useKeySmithStore = defineStore('keySmithStore', {
  state: (): KeySmithStoreState => ({
    temporaryKey: undefined
  }),
  getters: {
    hasTemporaryKey(): boolean {
      return this.temporaryKey !== undefined && KeyChecker.isAsymmetricKey(this.temporaryKey);
    }
  },
  actions: {
    async createPrivateKey() : Promise<PrivateKey> {
      this.temporaryKey = await KeyModule.generatePrivateKey();
      return this.temporaryKey;
    },
    async exportKey(key: GenericKey) : Promise<RawKey> {
      if(!KeyChecker.isKey(key)) {
        throw new Error('Key is not valid');
      }

      if(KeyChecker.isRawKey(key)) {
        return key;
      }

      return await KeyModule.exportKey(key);
    },
    async importKey(key: RawKey) : Promise<GenericKey> {
      if(KeyChecker.isKey(key)) {
        return key;
      }
      
      if(!KeyChecker.isRawKey(key)) {
        throw new Error('Key is not valid raw key');
      }

      return await KeyModule.importKey(key);
    }
  }
});