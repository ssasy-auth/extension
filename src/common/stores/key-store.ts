import { defineStore } from 'pinia';
import { KeyModule, KeyChecker } from '@this-oliver/ssasy';
import type { GenericKey, PrivateKey, RawKey } from '@this-oliver/ssasy';
import { useNotificationStore } from '~/common/stores/app';

interface KeyStoreState {
  temporaryKey: PrivateKey | undefined;
}
export const useKeyStore = defineStore('keyStore', {
  state: (): KeyStoreState => ({
    temporaryKey: undefined
  }),
  getters: {
    hasTemporaryKey(): boolean {
      const notificationStore = useNotificationStore();

      if(this.temporaryKey === undefined) {
        notificationStore.error('Key Error', 'No temporary key');
        return false;
      }
      
      if(!KeyChecker.isAsymmetricKey(this.temporaryKey)) {
        notificationStore.error('Key Error', 'Key is not assymetric');
        return false;
      }
      
      return true;
    }
  },
  actions: {
    async createPrivateKey() : Promise<PrivateKey> {
      this.temporaryKey = await KeyModule.generatePrivateKey();
      return this.temporaryKey;
    },
    async exportKey(key: GenericKey) : Promise<RawKey> {
      const notificationStore = useNotificationStore();

      if(!KeyChecker.isKey(key)) {
        throw notificationStore.error('Key Error', 'Key is not valid');
      }

      if(KeyChecker.isRawKey(key)) {
        return key as RawKey;
      }

      return await KeyModule.exportKey(key);
    },
    async importKey(key: RawKey) : Promise<GenericKey> {
      const notificationStore = useNotificationStore();

      if(KeyChecker.isKey(key as GenericKey) && !KeyChecker.isRawKey(key as GenericKey)) {
        return key as GenericKey;
      }
      
      if(!KeyChecker.isRawKey(key as GenericKey)) {
        throw notificationStore.error('Key Error', 'Key is not valid raw key');
      }

      return await KeyModule.importKey(key);
    }
  }
});
