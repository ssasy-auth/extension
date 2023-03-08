import { defineStore } from 'pinia';
import { useNotificationStore } from '~/stores/app-store';
import { VaultStorage } from '~/logic/storage';
import { KeyChecker, KeyModule, CryptoModule } from '@this-oliver/ssasy';
import type { PrivateKey } from '@this-oliver/ssasy';

const storedCiphertextString = VaultStorage;

export const useVaultStore = defineStore('vaultStore', {
  getters: {
    hasKey(): boolean {
      if(storedCiphertextString.value === undefined) {
        return false;
      }

      let ciphertext;
      
      try {
        ciphertext = JSON.parse(storedCiphertextString.value);
      } catch (error) {
        const message = (error as Error).message || 'parsing error';
        
        const notificationStore = useNotificationStore();
        notificationStore.notify('Vault Error', message, 500);
        return false;
      }

      return KeyChecker.isRawKey(ciphertext);
    }
  },
  actions: {
    async storeKey(key: PrivateKey, passphrase: string): Promise<void> {
      if(!KeyChecker.isAsymmetricKey(key)) {
        throw new Error('Key is not an asymmetric key');
      }

      const rawKey = await KeyModule.exportKey(key); // converts key to json-like object
      const plaintext = JSON.stringify(rawKey); // converts object to string
      const ciphertext = await CryptoModule.encrypt(passphrase, plaintext);
      const ciphertextString = JSON.stringify(ciphertext);
      storedCiphertextString.value = ciphertextString;
    },
    async getStoreKey(passphrase: string): Promise<PrivateKey> {
      if(!this.hasKey){
        throw new Error('No key stored');
      }

      const ciphertext = JSON.parse(storedCiphertextString.value as string);
      const plaintext = await CryptoModule.decrypt(passphrase, ciphertext);
      const rawKey = JSON.parse(plaintext);
      const key = await KeyModule.importKey(rawKey) as PrivateKey;
      return key;
    },
    async removeKey(): Promise<void> {
      storedCiphertextString.value = undefined;
    }
  }
});