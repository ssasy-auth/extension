import { defineStore } from 'pinia';
import { useNotificationStore } from './notification-store';
import { KeyChecker, KeyType, KeyModule, GenericKey } from '@this-oliver/ssasy';
import type { PublicKey, RawKey } from '@this-oliver/ssasy';
import { StorageUtil, processSsasyLikeError } from '~/common/utils';

const SESSION_DURATION = 12 * 60 * 60 * 1000; // 12 hours

const LocalSession = StorageUtil.Session;

interface SsasySession {
  /**
   * The public key of the user
   */
  publicKey: RawKey;
  /**
   * The timestamp of the session. This is used to determine if the session is expired
   */
  timestamp: number;
}

interface SessionStoreState {
  session: SsasySession | undefined;
}

export const useSessionStore = defineStore('session', {
  state: (): SessionStoreState => ({
    session: LocalSession.value as SsasySession || undefined
  }),
  getters: {
    hasSession(): boolean {
      const notificationStore = useNotificationStore();

      if(this.session === undefined) {
        notificationStore.error('Session Store', 'Session not set');
        return false;
      }

      if(!KeyChecker.isRawKey(this.session.publicKey as unknown as GenericKey)) {
        notificationStore.error('Session Store', 'Session public key is not an asymmetric key');
        return false;
      }

      if((this.session.publicKey as PublicKey).type !== KeyType.PublicKey) {
        notificationStore.error('Session Store', 'Session public key is not a public key');
        return false;
      }

      if(this.session.timestamp < new Date().getTime()) {
        notificationStore.error('Session Store', 'Session expired');
        return false;
      }

      return true;
    }
  },
  actions: {
    async setSession(publicKey: PublicKey) {
      this.resetSession();

      try {
        this.session = {
          publicKey: await KeyModule.exportKey(publicKey),
          timestamp: new Date().getTime() + SESSION_DURATION
        };
        
      } catch (err) {
        throw processSsasyLikeError(err);
      }

      LocalSession.value = this.session;
    },
    resetSession() {
      this.session = undefined;
      LocalSession.value = undefined;
    }
  }
});