import { defineStore } from 'pinia';
import { useKeyStore } from './key-store';
import { useNotificationStore } from '~/common/stores/app';
import { LocalStorage, processSsasyLikeError } from '~/common/utils';
import { KeyChecker, KeyModule, CryptoModule, CryptoChecker } from '@this-oliver/ssasy';
import type { PrivateKey } from '@this-oliver/ssasy';

export const useVaultStore = defineStore('vaultStore', {
  getters: {
    hasKey(): boolean {
      const notificationStore = useNotificationStore();
      const encryptedPrivateKeyString = LocalStorage.KeyPrivateEncryptedString.get();

      if (encryptedPrivateKeyString === undefined || encryptedPrivateKeyString === 'undefined') {
        notificationStore.error('Vault Error', 'No key stored');
        return false;
      }

      try {
        // check if ciphertext string is valid json
        const encryptedPrivateKey = JSON.parse(encryptedPrivateKeyString);

        // check if ciphertext has all required properties
        if (!CryptoChecker.isCiphertext(encryptedPrivateKey)) {
          return false;
        }

        // confirm that ciphertext is valid
        return true;
      } catch (err) {
        const error: Error = processSsasyLikeError(err);
        const message = error.message || 'parsing error';
        notificationStore.error('Vault Error', message);

        return false;
      }
    }
  },
  actions: {
    async storeKey(key: PrivateKey, passphrase: string): Promise<boolean> {
      const notificationStore = useNotificationStore();

      if (!KeyChecker.isAsymmetricKey(key)) {
        throw notificationStore.error('Vault Error', 'Key is not an asymmetric key');
      }

      let plaintextString: string;
      let encryptedPrivateKeyString: string;

      try {
        const rawKey = await KeyModule.exportKey(key); // converts key to json-like object
        plaintextString = JSON.stringify(rawKey); // converts object to string
      } catch (err) {
        const error: Error = processSsasyLikeError(err);

        const message = (error as Error).message || 'failed to export key';
        notificationStore.error('Vault Error', message, 500);
        return false;
      }

      try {
        const encryptedPrivateKey = await CryptoModule.encrypt(passphrase, plaintextString);
        encryptedPrivateKeyString = JSON.stringify(encryptedPrivateKey);
      } catch (err) {
        const error: Error = processSsasyLikeError(err);
        const message = error.message || 'encryption error';
        notificationStore.error('Vault Error', message, 500);

        return false;
      }

      // store ciphertext
      LocalStorage.KeyPrivateEncryptedString.set(encryptedPrivateKeyString);

      // reset key store
      const keyStore = useKeyStore();
      keyStore.$reset();

      return true;
    },
    async getStoreKey(passphrase: string): Promise<PrivateKey> {
      const notificationStore = useNotificationStore();

      if (this.hasKey === false || LocalStorage.KeyPrivateEncryptedString.get() === undefined) {
        throw notificationStore.error('Vault Error', 'No key stored');
      }

      // convert ciphertext string to object
      const encryptedPrivateKey = JSON.parse(LocalStorage.KeyPrivateEncryptedString.get() as string);

      // decrypt ciphertext
      let plaintext: string;

      try {
        plaintext = await CryptoModule.decrypt(passphrase, encryptedPrivateKey);

      } catch (err) {
        throw processSsasyLikeError(err);
      }

      // convert plaintext string to raw key object
      const rawKey = JSON.parse(plaintext);

      // import raw key object to key
      let key: PrivateKey;

      try {
        key = await KeyModule.importKey(rawKey) as PrivateKey;
      } catch (err) {
        throw processSsasyLikeError(err);
      }

      return key;
    },
    async removeKey(): Promise<boolean> {
      const notificationStore = useNotificationStore();

      if (!this.hasKey) {
        throw notificationStore.error('Vault Error', 'No key stored');
      }

      LocalStorage.KeyPrivateEncryptedString.set(undefined);
      return true;
    }
  }
});
