import { defineStore } from "pinia";
import type { PrivateKey } from "@/logic";
import { Wallet as SsasyWallet } from "@/logic";


interface WalletState {
  wallet: SsasyWallet | undefined
}

export const useWalletStore = defineStore("wallet", {
  state: (): WalletState => {
    return {
      wallet: undefined
    }
  },
  getters: {
    // ...
  },
  actions: {
    initWallet(privateKey: PrivateKey ) {
      this.wallet = new SsasyWallet(privateKey)
    }
  }
});
