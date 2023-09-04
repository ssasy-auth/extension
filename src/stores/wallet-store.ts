import { ref } from 'vue';
import { defineStore } from 'pinia';
import { processSsasyLikeError } from '~/utils';
import { useSettingStore, useNotificationStore } from '~/stores/app';
import { Wallet, SerializerModule } from '@ssasy-auth/core';
import type { PrivateKey, PublicKey } from '@ssasy-auth/core';

export const useWalletStore = defineStore('wallet', () => {
  const wallet = ref<Wallet>();

  async function setWallet(privateKey: PrivateKey): Promise<void> {
    const notificationStore = useNotificationStore();

    // throw error if wallet is already set
    if (wallet.value) {
      throw notificationStore.error('Wallet Store', 'Wallet already set. Please reset wallet first.')
    }

    try {
      // serialize private key
      const privateKeyUri: string = await SerializerModule.serializeKey(privateKey);

      // set wallet
      wallet.value = new Wallet(privateKeyUri);

    } catch (error) {
      throw notificationStore.error('Wallet Store', (error as Error).message || 'Failed to set wallet');
    }
  }

  async function getPublicKey(): Promise<PublicKey> {
    const notificationStore = useNotificationStore();

    if (!wallet.value) {
      throw notificationStore.error('Wallet Store', 'Wallet not set')
    }

    return await wallet.value.getPublicKey({ secure: true });
  }

  async function solveChallenge(encryptedChallengeUri: string, config?: { registrationMode: boolean }): Promise<string> {
    const notificationStore = useNotificationStore();
    const settingStore = useSettingStore();

    // throw error if wallet is not set
    if (!wallet.value) {
      throw notificationStore.error('Wallet Store', 'Wallet not set')
    }

    // throw error if encryptedChallengeString is missing
    if (!encryptedChallengeUri) {
      throw notificationStore.error('Wallet Store', 'Encrypted challenge is missing')
    }

    // throw error if encryptedChallengeString is not a string
    if (typeof encryptedChallengeUri !== 'string') {
      throw notificationStore.error('Wallet Store', 'Encrypted challenge is not a string')
    }

    // set requireSignature to false if registrationMode is true, otherwise use settingStore.requireSignature
    const requireSignature: boolean = config?.registrationMode === true ? false : await settingStore.isRequireSignature();

    let encryptedChallengeResponseUri: string;

    try {
      // solve challenge
      encryptedChallengeResponseUri = await wallet.value.generateChallengeResponse(encryptedChallengeUri, { requireSignature });
    } catch (err) {
      throw processSsasyLikeError(err);
    }

    return encryptedChallengeResponseUri;
  }

  function reset() {
    wallet.value = undefined;
  }

  return {
    wallet,
    setWallet,
    getPublicKey,
    solveChallenge,
    reset
  }
});
