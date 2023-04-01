import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useNotificationStore } from './notification-store';
import { KeyChecker, KeyType, KeyModule, GenericKey } from '@ssasy-auth/core';
import { useLocalStorage } from '~/composables/useLocalStorage';
import { StorageEnum, useBrowserStorage } from '~/composables/useBrowserStorage';
import { processSsasyLikeError } from '~/common/utils';
import type { PublicKey, RawKey } from '@ssasy-auth/core';
import type { RemovableRef } from '@vueuse/core';

interface LocalSession {
  /**
   * The public key of the user
   */
  publicKey: RawKey;
  /**
   * The timestamp of the session. This is used to determine if the session is expired
   */
  timestamp: number;
}

const LocalSession: RemovableRef<LocalSession | undefined> = useLocalStorage(StorageEnum.SESSION, undefined);

export const useSessionStore = defineStore('session', () => {
  const session = ref<LocalSession | undefined>(LocalSession.value);

  async function hasSession (): Promise<boolean> {
    const session: LocalSession = await useBrowserStorage('SESSION').get();
    return _verifySession(session);
  }

  async function setSession (publicKey: PublicKey) {
    resetSession();
    
    const SESSION_DURATION = 12 * 60 * 60 * 1000; // 12 hours
    
    try {
      session.value = {
        publicKey: await KeyModule.exportKey(publicKey),
        timestamp: new Date().getTime() + SESSION_DURATION
      };
      
    } catch (err) {
      throw processSsasyLikeError(err);
    }

    LocalSession.value = session.value;
  }

  function _verifySession (session: any): boolean {
    const notificationStore = useNotificationStore();

    if(session === undefined) {
      notificationStore.error('Session Store', 'Session not set');
      return false;
    }

    if(!KeyChecker.isRawKey(session.publicKey as unknown as GenericKey)) {
      notificationStore.error('Session Store', 'Session public key is not an asymmetric key');
      return false;
    }

    if((session.publicKey as PublicKey).type !== KeyType.PublicKey) {
      notificationStore.error('Session Store', 'Session public key is not a public key');
      return false;
    }

    if(session.timestamp < new Date().getTime()) {
      notificationStore.error('Session Store', 'Session has expired');
      return false;
    }

    return true;
  }

  const resetSession = () => {
    session.value = undefined;
    LocalSession.value = undefined;
  }

  return {
    session,
    hasSession,
    setSession,
    resetSession
  };
});
