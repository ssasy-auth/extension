import { defineStore } from 'pinia';
import { processSsasyLikeError } from '~/utils';
import { useLocalStorage } from '~/composables/useLocalStorage';
import { StorageEnum, useBrowserStorage } from '~/composables/useBrowserStorage';
import { useKeyStore, useNotificationStore } from '~/stores';
import { KeyChecker, KeyModule, CryptoModule, CryptoChecker } from '@ssasy-auth/core';
import type { PrivateKey, StandardCiphertext } from '@ssasy-auth/core';

export type LocalVaultKey = StandardCiphertext | undefined;

const localVaultStorage = useLocalStorage(StorageEnum.VAULT, undefined);

export const useVaultStore = defineStore('vault', () => {

  async function hasKey(): Promise<boolean> {
    const localVaultKey: LocalVaultKey = await useBrowserStorage('VAULT').get();

    return _verifyKey(localVaultKey);
  }

  async function wrapKey(privateKey: PrivateKey, passphrase: string): Promise<boolean> {
    const notificationStore = useNotificationStore();

    if (!KeyChecker.isAsymmetricKey(privateKey)) {
      throw notificationStore.error('Vault Error', 'Key is not an asymmetric key');
    }

    let plaintextString: string;
    let encryptedPrivateKey: StandardCiphertext;

    try {
      const rawKey = await KeyModule.exportKey(privateKey); // converts key to json-like object
      plaintextString = JSON.stringify(rawKey); // converts object to string
    } catch (err) {
      const error: Error = processSsasyLikeError(err);

      const message = (error as Error).message || 'failed to export key';
      notificationStore.error('Vault Error', message);
      return false;
    }

    try {
      encryptedPrivateKey = await CryptoModule.encrypt(passphrase, plaintextString);
    } catch (err) {
      const error: Error = processSsasyLikeError(err);
      const message = error.message || 'encryption error';
      notificationStore.error('Vault Error', message);

      return false;
    }

    // store ciphertext
    localVaultStorage.value = encryptedPrivateKey;

    // reset key store
    const keyStore = useKeyStore();
    keyStore.reset();

    return true;
  }

  async function unwrapKey(passphrase: string): Promise<PrivateKey> {
    const notificationStore = useNotificationStore();

    const vaultKey: LocalVaultKey = await useBrowserStorage('VAULT').get();

    if (vaultKey === undefined) {
      throw notificationStore.error('Vault Key Retrieval Error', 'No key stored');
    }

    // decrypt ciphertext
    let plaintext: string;

    try {
      plaintext = await CryptoModule.decrypt(passphrase, vaultKey);

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
  }

  async function removeKey(): Promise<boolean> {
    localVaultStorage.value = undefined;
    return true;
  }

  /**
   * @param key - vault key
   * @returns boolean
   */
  function _verifyKey(key: any): boolean {
    const notificationStore = useNotificationStore();

    if (key === undefined) {
      notificationStore.error('Vault Check Error', 'No key stored');
      return false;
    }

    try {
      // check if ciphertext has all required properties
      if (!CryptoChecker.isCiphertext(key)) {
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

  return {
    hasKey,
    wrapKey,
    unwrapKey,
    removeKey
  }
});
