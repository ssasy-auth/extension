import { defineStore } from 'pinia';
import { useKeyStore } from './key-store';
import { useNotificationStore } from '~/common/stores/app';
import { StorageUtil, processSsasyLikeError } from '~/common/utils';
import { KeyChecker, KeyModule, CryptoModule, CryptoChecker } from '@this-oliver/ssasy';
import type { PrivateKey, StandardCiphertext } from '@this-oliver/ssasy';

const LocalAuth = StorageUtil.Auth;

export const useVaultStore = defineStore('vaultStore', {
  state: () => ({
    encryptedPrivateKey: LocalAuth.value as StandardCiphertext | undefined
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
      LocalAuth.value = encryptedPrivateKey;

      // reset key store
      const keyStore = useKeyStore();
      keyStore.$reset();

      return true;
    },
    async unwrapKey(passphrase: string): Promise<PrivateKey> {
      const notificationStore = useNotificationStore();
      const encryptedPrivateKey: StandardCiphertext = await LocalAuth.value;

      if (encryptedPrivateKey === undefined) {
        throw notificationStore.error('Vault Key Retrieval Error', 'No key stored');
      }

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
      LocalAuth.value = undefined;
      return true;
    }
  }
});
