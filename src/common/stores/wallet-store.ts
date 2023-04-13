import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useSettingStore, useNotificationStore } from './app';
import { Wallet } from '@ssasy-auth/core';
import { processSsasyLikeError } from '../utils';
import { EncoderModule } from '@ssasy-auth/core';
import type { PrivateKey, PublicKey, AdvancedCiphertext } from '@ssasy-auth/core';

export const useWalletStore = defineStore('wallet',() => {
  const wallet = ref<Wallet | undefined>(undefined);

  const hasWallet = computed(() => wallet.value !== undefined);

  function setWallet(privateKey: PrivateKey): void {
    const notificationStore = useNotificationStore();

    if (hasWallet.value) {
      throw notificationStore.error('Wallet Store', 'Wallet already set')
    }

    try {
      // set wallet
      wallet.value = new Wallet(privateKey);

    } catch (error) {
      throw notificationStore.error('Wallet Store', (error as Error).message || 'Failed to set wallet');
    }
  }

  async function  getPublicKey(): Promise<PublicKey> {
    const notificationStore = useNotificationStore();

    if (!hasWallet.value || !wallet.value) {
      throw notificationStore.error('Wallet Store', 'Wallet not set')
    }

    return await wallet.value.getPublicKey();
  }

  async function solveChallenge(encryptedChallengeString: string, config?: { registrationMode: boolean }): Promise<string> {
    const notificationStore = useNotificationStore();
    const settingStore = useSettingStore();


    if (!hasWallet.value || !wallet.value) {
      throw notificationStore.error('Wallet Store', 'Wallet not set')
    }

    // set requireSignature to false if registrationMode is true, otherwise use settingStore.requireSignature
    const requireSignature: boolean = config?.registrationMode === true ? false : await settingStore.isRequireSignature();

    try {
      // decode ciphertext
      const encryptedChallenge: AdvancedCiphertext = await EncoderModule.decodeCiphertext(encryptedChallengeString);

      // solve challenge
      const encryptedSolution = await wallet.value.solveChallenge(encryptedChallenge, { requireSignature });

      // encode ciphertext and return
      return await EncoderModule.encodeCiphertext(encryptedSolution);
    } catch (err) {
      throw processSsasyLikeError(err);
    }
  }

  function reset(){
    wallet.value = undefined;
  }

  return {
    wallet,
    hasWallet,
    setWallet,
    getPublicKey,
    solveChallenge,
    reset
  }
});
