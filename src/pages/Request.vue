<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { SsasyMessenger, MessageType } from '~/common/logic';
import { PopupPage } from '~/common/utils';
import {
  useVaultStore,
  useWalletStore,
  useSessionStore,
  useNotificationStore
} from '~/common/stores';
import type {
  RequestMode,
  BaseMessage,
  ChallengeRequest
} from '~/common/logic';
import type { ActionItem } from '~/components/Base/BaseCard.vue';
import BasePage from '~/components/Base/BasePage.vue';
import BaseCard from '~/components/Base/BaseCard.vue';
import AuthForm from '~/components/Auth/AuthForm.vue';

const route = useRoute();
const router = useRouter();
const loading = ref<boolean>(false);
const requestError = ref<string | undefined>(undefined);

const mode = ref<RequestMode | undefined>(undefined);
const origin = ref<string | undefined>(undefined);
const publicKeyString = ref<string | undefined>(undefined);
const challengeCiphertextString = ref<string | undefined>(undefined);

const options: ActionItem[] = [
  {
    label: 'Accept',
    color: 'success',
    action: async () => {
      await approvePublicKeyRequest();
      loading.value = false;
    }
  },
  {
    label: 'Reject',
    color: 'error',
    action: () => {
      rejectPublicKeyRequest();
    }
  }
];

const requestText = computed(() => {
  return mode.value === 'login' ? 'login' : 'register';
});

/**
 * Sends the public key to the origin
 */
async function approvePublicKeyRequest() {
  try {
    loading.value = true;
    if (mode.value === undefined) {
      throw new Error('Mode is undefined');
    }

    if (origin.value === undefined) {
      throw new Error('Origin is undefined');
    }

    if (publicKeyString.value === undefined) {
      throw new Error('Public key is undefined');
    }

    SsasyMessenger.broadcastPublicKeyResponse(publicKeyString.value);
    loading.value = false;
  } catch (error) {
    const notificationStore = useNotificationStore();
    const errorMessage = notificationStore.error('Service Registration', (error as Error).message || 'Failed to approve registration request.')
    SsasyMessenger.broadcastPublicKeyResponse(null, errorMessage);

    // close popup if error occurs
    closePopup();
  }
}

/**
 * Sends a null response to the origin
 */
function rejectPublicKeyRequest() {
  if (origin.value === undefined) {
    const notificationStore = useNotificationStore();
    const errorMessage = notificationStore.error('Service Registration', 'Origin is undefined')
    SsasyMessenger.broadcastPublicKeyResponse(null, errorMessage);
  }

  else {
    SsasyMessenger.broadcastPublicKeyResponse(null);
  }

  closePopup();
}

/**
 * Solves the challenge and sends the solution to the origin
 * 
 * @param password - password to unlock wallet
 */
async function handleRequestChallenge(password: string) {
  loading.value = true;
  const vaultStore = useVaultStore();
  const walletStore = useWalletStore();
  const notificationStore = useNotificationStore();

  try {
    const privateKey = await vaultStore.getStoreKey(password);
    walletStore.setWallet(privateKey);
  } catch (error) {
    const errorMessage = (error as Error).message || 'Failed to unlock wallet.';
    requestError.value = errorMessage;
    return notificationStore.error('Service Registration', errorMessage);
  }

  try {
    if (challengeCiphertextString.value === undefined) {
      throw new Error('Challenge encryption is undefined');
    }

    const solutionCiphertextString = await walletStore.solveChallenge(
      challengeCiphertextString.value,
      { registrationMode: mode.value === 'registration' }
    );
    SsasyMessenger.broadcastChallengeResponse(solutionCiphertextString);

    loading.value = false;
  } catch (error) {
    const errorMessage = notificationStore.error('Service Registration', (error as Error).message || 'Failed to solve challenge.');
    SsasyMessenger.broadcastChallengeResponse(null, errorMessage);
  }

  // close popup
  closePopup();
}

/**
 * Close the popup window and resets the wallet store.
 */
function closePopup() {
  const walletStore = useWalletStore();
  walletStore.$reset();

  PopupPage.close();
}

onMounted(async () => {
  const notificationStore = useNotificationStore();

  try {
    // set mode
    if (
      (route.query.mode as RequestMode) === 'registration' ||
      (route.query.mode as RequestMode) === 'login'
    ) {
      mode.value = route.query.mode as RequestMode;
    } else {
      throw new Error('Invalid request mode');
    }

    // set origin
    if (typeof route.query.origin === 'string') {
      origin.value = route.query.origin;
    } else {
      throw new Error('Invalid origin');
    }

    // set public key
    const vaultStore = useVaultStore();
    const sessionStore = useSessionStore();

    // if no key, redirect to setup
    if (!vaultStore.hasKey) {
      return router.push({
        path: '/setup',
        query: {
          ...route.query,
          redirect: route.path
        }
      });
    }

    // if no session, redirect to login
    else if (!sessionStore.hasSession) {
      return router.push({
        path: '/auth',
        query: {
          ...route.query,
          redirect: route.path
        }
      });
    }

    else {
      const rawPublic = sessionStore.session?.publicKey;
      publicKeyString.value = JSON.stringify(rawPublic);
    }

    // listen for challenge response broadcast from [popup] and forward to [content script]
    // eslint-disable-next-line no-undef
    browser.runtime.onMessage.addListener(async (msg) => {
      const message: BaseMessage = {
        type: msg.type
      };

      if (message.type === MessageType.REQUEST_SOLUTION) {
        const request: ChallengeRequest = {
          origin: msg.origin,
          mode: msg.mode,
          type: MessageType.REQUEST_SOLUTION,
          challenge: msg.challenge
        };

        // set challenge
        challengeCiphertextString.value = request.challenge;
      }
    });

  } catch (error) {
    const errorMessage = (error as Error).message || 'Failed to setup public key.';
    notificationStore.error('Service Registration', errorMessage)
    SsasyMessenger.broadcastPublicKeyResponse(null, errorMessage);
  }
});
</script>

<template>
  <base-page title="Registration Request">
    <v-row justify="center" class="request">
      <v-col v-if="challengeCiphertextString" cols="11" md="6">
        <base-card class="mt-2 pa-1">
          <p>Enter your password to confirm the registration request.</p>
        </base-card>

        <auth-form class="mt-2" style="padding-top: 20px;" @input="handleRequestChallenge" />
      </v-col>

      <v-col v-else cols="11" md="6">
        <base-card :actions="options" :action-centered="true" class="text-center pa-1">
          <p class="request-promt">Do you grant permission to <b class="underline">{{ requestText }}</b> with the
            <b><code>{{ origin }}</code></b> service?
          </p>
        </base-card>
      </v-col>

      <v-divider class="border-opacity-0" />

      <v-col v-if="requestError" cols="auto">
        <base-card color="error" class="text-center pa-1">
          <p>
            {{ requestError }}
          </p>
        </base-card>
      </v-col>
    </v-row>
  </base-page>
</template>

<style>
.request {
  margin-top: 25px;
}

.request-promt {
  font-size: 1.15rem;
}
</style>