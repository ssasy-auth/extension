import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { KeyModule, KeyChecker } from '@ssasy-auth/core';
import type { GenericKey, PrivateKey, RawKey } from '@ssasy-auth/core';
import { useNotificationStore } from '~/common/stores/app';

export const useKeyStore = defineStore('key', () => {
  const temporaryKey = ref<PrivateKey | undefined>(undefined);

  const hasTemporaryKey = computed<boolean>(() => {
    const notificationStore = useNotificationStore();

    if(temporaryKey.value === undefined) {
      notificationStore.error('Key Error', 'No temporary key');
      return false;
    }
      
    if(!KeyChecker.isAsymmetricKey(temporaryKey.value)) {
      notificationStore.error('Key Error', 'Key is not asymmetric');
      return false;
    }
      
    return true;
  });

  async function createPrivateKey() : Promise<PrivateKey> {
    temporaryKey.value = await KeyModule.generatePrivateKey();
    return temporaryKey.value;
  }

  async function exportKey(key: GenericKey) : Promise<RawKey> {
    const notificationStore = useNotificationStore();

    if(!KeyChecker.isKey(key)) {
      throw notificationStore.error('Key Error', 'Key is not valid');
    }

    if(KeyChecker.isRawKey(key)) {
      return key as RawKey;
    }

    return await KeyModule.exportKey(key);
  }

  async function importKey(key: RawKey) : Promise<GenericKey> {
    const notificationStore = useNotificationStore();

    if(KeyChecker.isKey(key as GenericKey) && !KeyChecker.isRawKey(key as GenericKey)) {
      return key as GenericKey;
    }
      
    if(!KeyChecker.isRawKey(key as GenericKey)) {
      throw notificationStore.error('Key Error', 'Key is not valid raw key');
    }

    return await KeyModule.importKey(key);
  }

  function reset() {
    temporaryKey.value = undefined;
  }
  
  return {
    temporaryKey,
    hasTemporaryKey,
    createPrivateKey,
    exportKey,
    importKey,
    reset
  };
});
