import { defineStore } from 'pinia';
import { useNotificationStore } from './app-store';
import { Wallet, CryptoModule } from '@this-oliver/ssasy';
import type { PrivateKey } from '@this-oliver/ssasy';

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
    setWallet(privateKey: PrivateKey) {
      const notificationStore = useNotificationStore();

      if(this.hasWallet){
        throw notificationStore.error('Wallet Store', 'Wallet already set')
      }

      this.wallet = new Wallet(privateKey);
    },
    async hashMessage(message: string): Promise<string> {
      const notificationStore = useNotificationStore();

      if(!this.hasWallet){
        throw notificationStore.error('Wallet Store', 'Wallet not set')
      }

      return await CryptoModule.hash(message);
    }
  }
});
