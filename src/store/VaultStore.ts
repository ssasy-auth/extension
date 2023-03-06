import { KeyModule, CryptoModule, type PrivateKey, type RawKey } from "@/logic"
import { defineStore } from "pinia";
import { get, save, remove } from "@/services/storage";
import { useNotificationStore } from "./AppStore";

const ERROR_MESSAGE = {
  KEY_NOT_FOUND: "Key not found"
}

const VAULT_PREFIX = "ssasy-vault";
const STORED_KEY = `${VAULT_PREFIX}-key`;

const errorStore = useNotificationStore();

export const useVaultStore = defineStore("vault", {
  getters: {
    hasKey(): boolean {      
      // check for key in local storage
      const key = get(STORED_KEY);
      // return true if key is found, false otherwise
      return key !== null;
    }
  },
  actions: {
    async storeKey(key: PrivateKey, passphrase: string): Promise<boolean> {
      try {
        // convert `key` to `raw key`
        const rawKey = await KeyModule.exportKey(key);
        // encrypt key with `password`
        const plaintext = JSON.stringify(rawKey);
        const ciphertext = await CryptoModule.encrypt(passphrase, plaintext);
        // store encrypted key in local storage
        save(STORED_KEY, JSON.stringify(ciphertext));
        // return confirmation
        return true;
      } catch (error) {
        errorStore.addError("Vault Error", (error as Error).message);
        
        return false;
      }
    },
    async getKey(passphrase: string): Promise<PrivateKey> {
      try {
        // check for key in local storage
        const value = get(STORED_KEY);
        // if key is not found, return error or null
        if (value === null) throw new Error(ERROR_MESSAGE.KEY_NOT_FOUND);
        // decrypt key with `password`
        const ciphertext = JSON.parse(value as string);
        const plaintext = await CryptoModule.decrypt(passphrase, ciphertext);
        // convert `raw key` to `key`
        return await KeyModule.importKey(JSON.parse(plaintext)) as PrivateKey;
      } catch (error) {
        errorStore.addError("Vault Error", (error as Error).message);
        throw error;
      }
    },
    removeKey(): boolean {
      try {
        // remove key from local storage
        remove(STORED_KEY);
        // return confirmation
        return true;        
      } catch (error) {
        errorStore.addError("Vault Error", (error as Error).message);
        return false;
      }
    }
  }
});

export const useKeyStore = defineStore("key", {
  state() {
    return {
      temporaryKey: null as PrivateKey | null
    };
  },
  actions: {
    async createKey() {
      this.temporaryKey = await KeyModule.generatePrivateKey();
      return this.temporaryKey;
    },
    async importKey(key: RawKey) {
      return await KeyModule.importKey(key);
    },
    async exportKey(key: PrivateKey) {
      return await KeyModule.exportKey(key);
    }
  }
});