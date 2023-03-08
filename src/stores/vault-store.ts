import { defineStore } from 'pinia';
import { useKeyStore } from './key-store';
import { useNotificationStore } from '~/stores/app-store';
import { VaultStorage } from '~/logic/storage';
import { KeyChecker, KeyModule, CryptoModule } from '@this-oliver/ssasy';
import type { PrivateKey } from '@this-oliver/ssasy';

const storedCiphertextString = VaultStorage;

export const useVaultStore = defineStore('vaultStore', {
  getters: {
    hasKey(): boolean {
      if(storedCiphertextString.value === undefined || storedCiphertextString.value === 'undefined') {
        return false;
      }
      
      let ciphertext;
      try {
        ciphertext = JSON.parse(storedCiphertextString.value);
      } catch (error) {
        const message = (error as Error).message || 'parsing error';
        
        const notificationStore = useNotificationStore();
        notificationStore.error('Vault Error', message);
        return false;
      }

      return KeyChecker.isRawKey(ciphertext);
    }
  },
  actions: {
    async storeKey(key: PrivateKey, passphrase: string): Promise<boolean> {
      const notificationStore = useNotificationStore();

      if(!KeyChecker.isAsymmetricKey(key)) {
        notificationStore.error('Vault Error', 'Key is not an asymmetric key');
      }

      let plaintextString: string;
      let ciphertextString: string;

      try {
        const rawKey = await KeyModule.exportKey(key); // converts key to json-like object
        plaintextString = JSON.stringify(rawKey); // converts object to string
      } catch (error) {
        const message = (error as Error).message || 'failed to export key';
        notificationStore.error('Vault Error', message, 500);
        return false;
      }

      try {
        const ciphertext = await CryptoModule.encrypt(passphrase, plaintextString);
        ciphertextString = JSON.stringify(ciphertext);
      } catch (error) {
        const message = (error as Error).message || 'encryption error';
        notificationStore.error('Vault Error', message, 500);
        return false; 
      }

      // store ciphertext
      storedCiphertextString.value = ciphertextString;

      // reset key store
      const keyStore = useKeyStore();
      keyStore.$reset();

      return true;
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