import { defineStore } from 'pinia';
import { useLocalStorage } from '~/composables/useLocalStorage';
import { processSsasyLikeError } from '~/common/utils';
import { useKeyStore, useNotificationStore } from '~/common/stores';
import { KeyChecker, KeyModule, CryptoModule, CryptoChecker } from '@this-oliver/ssasy';
import type { RemovableRef } from '@vueuse/core';
import type { PrivateKey, StandardCiphertext } from '@this-oliver/ssasy';

interface VaultStoreState {
  encryptedPrivateKey: StandardCiphertext | undefined;
}

const STORAGE_KEY = 'store-vault';
const LocalEncryptedPrivateKey: RemovableRef<StandardCiphertext | undefined> = useLocalStorage(STORAGE_KEY, undefined);

export const useVaultStore = defineStore('vaultStore', {
  state: (): VaultStoreState => ({
    encryptedPrivateKey: LocalEncryptedPrivateKey.value
  }),
  getters: {
    hasKey(): boolean {
      const notificationStore = useNotificationStore();

      if (this.encryptedPrivateKey === undefined) {
        notificationStore.error('Vault Check Error', 'No key stored');
        return false;
      }

      try {
        // check if ciphertext has all required properties
        if (!CryptoChecker.isCiphertext(this.encryptedPrivateKey)) {
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
    async wrapKey(key: PrivateKey, passphrase: string): Promise<boolean> {
      const notificationStore = useNotificationStore();

      if (!KeyChecker.isAsymmetricKey(key)) {
        throw notificationStore.error('Vault Error', 'Key is not an asymmetric key');
      }

      let plaintextString: string;
      let encryptedPrivateKey: StandardCiphertext;

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
        encryptedPrivateKey = await CryptoModule.encrypt(passphrase, plaintextString);
      } catch (err) {
        const error: Error = processSsasyLikeError(err);
        const message = error.message || 'encryption error';
        notificationStore.error('Vault Error', message, 500);

        return false;
      }

      // store ciphertext
      this.encryptedPrivateKey = encryptedPrivateKey;
      LocalEncryptedPrivateKey.value = encryptedPrivateKey;

      // reset key store
      const keyStore = useKeyStore();
      keyStore.$reset();

      return true;
    },
    async unwrapKey(passphrase: string): Promise<PrivateKey> {
      const notificationStore = useNotificationStore();

      if (this.encryptedPrivateKey === undefined) {
        throw notificationStore.error('Vault Key Retrieval Error', 'No key stored');
      }

      // decrypt ciphertext
      let plaintext: string;

      try {
        plaintext = await CryptoModule.decrypt(passphrase, this.encryptedPrivateKey);

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
      this.encryptedPrivateKey = undefined;
      LocalEncryptedPrivateKey.value = undefined;
      return true;
    }
  }
});
