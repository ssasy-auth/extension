import { defineStore } from 'pinia';
import { useKeyStore } from './key-store';
import { useNotificationStore } from '~/stores/app-store';
import { KEY_STORAGE } from '~/logic/storage';
import { KeyChecker, KeyModule, CryptoModule } from '@this-oliver/ssasy';
import type { PrivateKey } from '@this-oliver/ssasy';

export const useVaultStore = defineStore('vaultStore', {
  getters: {
    hasKey(): boolean {
      const notificationStore = useNotificationStore();
      const ciphertextString = KEY_STORAGE.value;

      if(ciphertextString === undefined || ciphertextString === 'undefined') {
        notificationStore.error('Vault Error', 'No key stored');
        return false;
      }

      try {
        // check if ciphertext string is valid json
        const ciphertext = JSON.parse(ciphertextString);

        // check if ciphertext has all required properties
        if(
          !ciphertext.iv || // iv is used to encrypt the data
          !ciphertext.salt || // salt is used to generate the key that encrypts the ciphertext
          !ciphertext.data // the encrypted data
        ){
          return false;
        }

        // confirm that ciphertext is valid
        return true;
      } catch (error) {
        const message = (error as Error).message || 'parsing error';
        notificationStore.error('Vault Error', message);
        return false;
      }
    }
  },
  actions: {
    async storeKey(key: PrivateKey, passphrase: string): Promise<boolean> {
      const notificationStore = useNotificationStore();

      if(!KeyChecker.isAsymmetricKey(key)) {
        throw notificationStore.error('Vault Error', 'Key is not an asymmetric key');
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
      KEY_STORAGE.value = ciphertextString;

      // reset key store
      const keyStore = useKeyStore();
      keyStore.$reset();

      return true;
    },
    async getStoreKey(passphrase: string): Promise<PrivateKey> {
      const notificationStore = useNotificationStore();

      if(this.hasKey === false || !KEY_STORAGE.value){
        throw notificationStore.error('Vault Error', 'No key stored');
      }

      // convert ciphertext string to object
      const ciphertext = JSON.parse(KEY_STORAGE.value);

      // decrypt ciphertext
      const plaintext = await CryptoModule.decrypt(passphrase, ciphertext);

      // convert plaintext string to raw key object
      const rawKey = JSON.parse(plaintext);

      // import raw key object to key
      const key = await KeyModule.importKey(rawKey) as PrivateKey;
      
      return key;
    },
    async removeKey(): Promise<boolean> {
      const notificationStore = useNotificationStore();

      if(!this.hasKey) {
        throw notificationStore.error('Vault Error', 'No key stored');
      }

      KEY_STORAGE.value = undefined;
      return true;
    }
  }
});
