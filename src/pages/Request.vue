<script setup lang="ts">
/**
 * Authentication request page
 * 
 * The purpose of this page is to handle the authentication request from the
 * a service provider via the [background] script. Basically, the request 
 * takes the following steps:
 * 
 * 1. The service provider sends a request to the [background] script
 * 2. The [background] script broadcasts the request to all open tabs
 * 3. This page captures the broadcast and requests user consent to process the request
 * 4. If the user consents, this page sends the public key to the [background] script
 * 5. The [background] script sends the public key to the service provider
 */

import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useMessenger } from '~/composables/useMessenger';
import { PopupPage } from '~/utils';
import {
  useWalletStore,
  useSessionStore,
  useNotificationStore
} from '~/stores';
import { MessageType } from '~/bridge';
import type {
  RequestMode,
  BaseMessage,
  ChallengeRequest
} from '~/bridge';
import type { ActionItem } from '~/components/base/BaseCard.vue';
import BasePage from '~/components/base/BasePage.vue';
import BaseCard from '~/components/base/BaseCard.vue';
import BaseBtn from '~/components/base/BaseBtn.vue';
import VaultAuthForm from '~/components/forms/VaultAuthForm.vue';
import { SerializerModule } from '@ssasy-auth/core';
import type { PrivateKey, RawKey } from '@ssasy-auth/core';

const route = useRoute();
const walletStore = useWalletStore();
const notificationStore = useNotificationStore();
const { broadcastPublicKeyResponse, broadcastChallengeResponse } = useMessenger();

const loading = ref<boolean>(false);
const errorMessage = ref<string>();
const closingMessage = ref<string>();
const messageCountdown = ref<number>(-1); // in milliseconds

const mode = ref<RequestMode>();
const origin = ref<string>();
const publicKeyUri = ref<string>();
const encryptedChallengeUri = ref<string>();

const options: ActionItem[] = [
  {
    label: 'Accept',
    color: 'success',
    action: async () => {
      await approvePublicKeyRequest();
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

const countdown = computed<number>(() => {
  return Math.round(messageCountdown.value / 1000);
});

const requestText = computed<string>(() => {
  return mode.value === 'login' ? 'login' : 'register';
});

/**
 * Sends the public key to the origin
 */
async function approvePublicKeyRequest() {
  loading.value = true;

  try {
    if (mode.value === undefined) {
      throw new Error('Authentication request is missing a mode');
    }

    if (origin.value === undefined) {
      throw new Error('Authentication request is missing an origin');
    }

    if (publicKeyUri.value === undefined) {
      throw new Error('Public key is missing');
    }

    broadcastPublicKeyResponse(publicKeyUri.value);
  } catch (error) {
    const message = notificationStore.error('Authentication Request', (error as Error).message || 'Failed to approve registration request.', { toast: true })
    broadcastPublicKeyResponse(null, message);

    // stop loading
    loading.value = false;

    // set final message
    errorMessage.value = message;
  }
}

/**
 * Sends a null response to the origin
 */
function rejectPublicKeyRequest() {
  broadcastPublicKeyResponse(null);
  
  // set final message
  closingMessage.value = 'Request rejected.';
}

/**
 * Solves the challenge and sends the challenge response to the origin
 */
async function approveChallengeRequest(privateKey: PrivateKey) {
  loading.value = true;

  try {
    // set wallet
    await walletStore.setWallet(privateKey);
  } catch (error) {
    loading.value = false;

    const message = (error as Error).message || 'Failed to unlock wallet.';
    errorMessage.value = message;
    return notificationStore.error('Authentication Request', message, { toast: true });
  }

  try {
    if (encryptedChallengeUri.value === undefined) {
      throw new Error('Challenge encryption is undefined');
    }

    const challengeResponseUri = await walletStore.solveChallenge(
      encryptedChallengeUri.value,
      { registrationMode: mode.value === 'registration' }
    );

    broadcastChallengeResponse(challengeResponseUri);
  } catch (error) {
    const message = notificationStore.error('Authentication Request', (error as Error).message || 'Failed to solve challenge.', { toast: true });
    broadcastChallengeResponse(null, message);

    // set final message
    errorMessage.value = message;
  }

  // stop loading
  loading.value = false;

  // kill wallet
  walletStore.reset();

  // set final message if no error
  if (errorMessage.value === undefined){
    closingMessage.value = 'Authentication successful!';
  }
}

/**
 * Sends a null response to the origin
 */
function rejectChallengeRequest() {
  broadcastChallengeResponse(null);

  // set final message
  closingMessage.value = 'Request rejected.';
}

/**
 * Close the popup window and resets the wallet store.
 */
function closePopup() {
  walletStore.reset();
  PopupPage.close();
}

// watch for final message and start countdown to close popup
watch(closingMessage, (value) => {
  if (value !== undefined) {

    // set countdown to 10 seconds
    messageCountdown.value = 10000;
    
    // start countdown
    const interval = setInterval(() => {
      messageCountdown.value -= 1000;

      if (messageCountdown.value <= 0) {
        clearInterval(interval);
        closePopup();
      }
    }, 1000);
  }
});

// set up page
onMounted(async () => {
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

    // get raw public key
    const sessionStore = useSessionStore();
    const rawPublicKey: RawKey | undefined = sessionStore.session?.publicKey;

    // set public key URI if raw public key exists
    if(rawPublicKey){
      publicKeyUri.value = await SerializerModule.serializeKey(rawPublicKey);
    }

    // listen for challenge request broadcast from [background] and set challenge
    // eslint-disable-next-line no-undef
    browser.runtime.onMessage.addListener(async (msg) => {
      const message: BaseMessage = { type: msg.type };

      if (message.type === MessageType.REQUEST_CHALLENGE_RESPONSE) {
        const request: ChallengeRequest = {
          origin: msg.origin,
          mode: msg.mode,
          type: MessageType.REQUEST_CHALLENGE_RESPONSE,
          challenge: msg.challenge
        };

        // set challenge
        encryptedChallengeUri.value = request.challenge;

        loading.value = false;
      }
    });

  } catch (error) {
    const message = (error as Error).message || 'Failed to setup public key.';
    notificationStore.error('Authentication Request', message, { toast: true })
    broadcastPublicKeyResponse(null, message);

    // set final message
    errorMessage.value = message;
  }
});
</script>

<template>
  <base-page title="Authentication Request">
    <v-row
      justify="center"
      class="request">
      <v-col
        v-if="closingMessage"
        cols="11"
        md="6"
        class="text-center">

        <base-card>
          <div
            class="request-promt"
            style="margin-bottom: 50px;">
            <div
              v-if="countdown > 0"
              class="text-grey"
              style="font-size: 2rem;">
              {{ countdown }}
            </div>
  
            <div style="font-size: 1.15rem;">
              {{ closingMessage }}
            </div>
          </div>
  
          <base-btn
            class="mt-2 mx-auto"
            @click="closePopup">
            Close
          </base-btn>
        </base-card>
      </v-col>

      <v-col
        v-else-if="encryptedChallengeUri"
        cols="11"
        md="6"
        class="text-center">
        <base-card class="mt-2 pa-1">
          <p class="request-promt">Enter your password to confirm the {{ mode }} request.</p>
        </base-card>

        <vault-auth-form
          class="mt-2"
          style="padding-top: 20px;"
          :loading="loading"
          @input="approveChallengeRequest" />

        <base-btn
          :text="true"
          color="grey"
          class="mt-2 mx-auto"
          @click="rejectChallengeRequest">
          Cancel
        </base-btn>
      </v-col>

      <v-col
        v-else-if="loading"
        cols="11"
        md="6">
        <v-skeleton-loader
          color="primary"
          type="card" />
      </v-col>

      <v-col
        v-else
        cols="11"
        md="6">
        <base-card
          :actions="options"
          :action-centered="true"
          class="text-center pa-1">
          <p class="request-promt">Do you grant permission to <b class="underline">{{ requestText }}</b> with the
            <b><code>{{ origin }}</code></b> service?
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