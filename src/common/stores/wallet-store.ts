import { defineStore } from 'pinia';
import { useSettingStore, useNotificationStore } from './app';
import { Wallet } from '@this-oliver/ssasy';
import { processSsasyLikeError } from '../utils';
import { EncoderModule } from '@this-oliver/ssasy';
import type { PrivateKey, PublicKey } from '@this-oliver/ssasy';

interface WalletStoreState {
  wallet: Wallet | undefined;
}
export const useWalletStore = defineStore('wallet', {
  state: (): WalletStoreState => ({
    wallet: undefined
  }),
  getters: {
    hasWallet(): boolean {
      return this.wallet !== undefined;
    }
  },
  actions: {
    setWallet(privateKey: PrivateKey): void {
      const notificationStore = useNotificationStore();

      if (this.hasWallet) {
        throw notificationStore.error('Wallet Store', 'Wallet already set')
      }

      try {
        // set wallet
        this.wallet = new Wallet(privateKey);

      } catch (error) {
        throw notificationStore.error('Wallet Store', (error as Error).message || 'Failed to set wallet');
      }
    },
    async getPublicKey(): Promise<PublicKey> {
      const notificationStore = useNotificationStore();

      if (!this.hasWallet || !this.wallet) {
        throw notificationStore.error('Wallet Store', 'Wallet not set')
      }

      return await this.wallet.getPublicKey();
    },
    async solveChallenge(encryptedChallengeString: string, config?: { registrationMode: boolean }): Promise<string> {
      const notificationStore = useNotificationStore();
      const settingStore = useSettingStore();


      if (!this.hasWallet) {
        throw notificationStore.error('Wallet Store', 'Wallet not set')
      }

      try {
        // decode ciphertext
        const encryptedChallenge = await EncoderModule.decodeCiphertext(encryptedChallengeString);

        // solve challenge
        const encryptedSolution = await this.wallet!.solveChallenge(
          encryptedChallenge, 
          { requireSignature: config?.registrationMode === true ? false : settingStore.requireSignature }
        );

        // encode ciphertext and return
        return await EncoderModule.encodeCiphertext(encryptedSolution);
      } catch (err) {
        throw processSsasyLikeError(err);
      }
    }
  }
});
