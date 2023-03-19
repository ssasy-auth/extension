<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { SsasyMessenger, MessageType } from '~/common/logic';
import { PopupPage } from '~/common/utils';
import { useVaultStore, useSessionStore, useWalletStore, useNotificationStore } from '~/common/stores';
import type { GenericMessage, ChallengeRequest } from '~/common/logic';
import type { ActionItem } from '~/components/Base/BaseCard.vue';
import BasePage from '~/components/Base/BasePage.vue';
import BaseCard from '~/components/Base/BaseCard.vue';
import AuthForm from '~/components/Auth/AuthForm.vue';

type RequestMode = 'registration' | 'login';

const route = useRoute();
const router = useRouter();
const loading = ref<boolean>(false);
const error = ref<string | undefined>(undefined);

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

async function approvePublicKeyRequest(){
  try {
    loading.value = true;
    if(origin.value === undefined){
      throw new Error('Origin is undefined');
    }

    if(publicKeyString.value === undefined){
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

function rejectPublicKeyRequest(){
  if(origin.value === undefined){
    const notificationStore = useNotificationStore();
    const errorMessage = notificationStore.error('Service Registration', 'Origin is undefined')
    SsasyMessenger.broadcastPublicKeyResponse(null, errorMessage);
  }
  
  else {
    SsasyMessenger.broadcastPublicKeyResponse(null);
  }
  
  closePopup();
}

async function handleAuthentication(password: string){
  loading.value = true;
  const vaultStore = useVaultStore();
  const walletStore = useWalletStore();

  try {
    const privateKey = await vaultStore.getStoreKey(password);
    walletStore.setWallet(privateKey);

    if(challengeCiphertextString.value === undefined){
      throw new Error('Challenge ciphertext is undefined');
    }

    const solutionCiphertextString = await walletStore.solveChallenge(challengeCiphertextString.value);
    SsasyMessenger.broadcastChallengeResponse(solutionCiphertextString);
    
    loading.value = false;
  } catch (error) {
    const notificationStore = useNotificationStore();
    const errorMessage = notificationStore.error('Service Registration', (error as Error).message || 'Failed to solve challenge.');
    SsasyMessenger.broadcastChallengeResponse(null, errorMessage);  
  }
  
  // close popup
  closePopup();
}

/**
 * Close the popup window and resets the wallet store.
 */
function closePopup(){
  const walletStore = useWalletStore();
  walletStore.$reset();
  
  PopupPage.close();
}

onMounted(async () => {
  const notificationStore = useNotificationStore();
  
  try {
    // set mode
    if(
      (route.query.mode as RequestMode) === 'registration' ||
      (route.query.mode as RequestMode) === 'login'
    ){
      mode.value = route.query.mode as RequestMode;
    } else {
      throw new Error('Invalid request mode');
    }

    // set origin
    if(typeof route.query.origin === 'string'){
      origin.value = route.query.origin;
    } else {
      throw new Error('Invalid origin');
    }
    
    
    // set public key
    const vaultStore = useVaultStore();
    const sessionStore = useSessionStore();

    // if no key, redirect to setup
    if(!vaultStore.hasKey){
      return router.push({ 
        path: '/setup', 
        query: {
          ...route.query,
          redirect: route.path
        } 
      });
    }

    // if no session, redirect to login
    else if(!sessionStore.hasSession){
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
      const message: GenericMessage = {
        type: msg.type
      };

      if(message.type === MessageType.RequestSolution) {
        const request: ChallengeRequest = {
          origin: msg.origin,
          type: MessageType.RequestSolution,
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
    <v-row justify="center">
      <v-col
        v-if="error"
        cols="11"
        md="6">
        <base-card
          title="Oops"
          class="pa-1">
          <p>
            {{ error }}
          </p>
        </base-card>
      </v-col>

      <v-col
        v-if="challengeCiphertextString"
        cols="11"
        md="6">
        <base-card class="mt-2 pa-1">
          <p>Enter your password to confirm the registration request.</p>
        </base-card>
        
        <auth-form
          class="mt-2"
          style="padding-top: 20px;"
          @input="handleAuthentication" />
      </v-col>

      <v-col
        v-else
        cols="11"
        md="6">
        <base-card
          :actions="options"
          class="pa-1 text center">
          <p><b><code>{{ origin }}</code></b> want to register your account with their service.</p>
        </base-card>
      </v-col>
    </v-row>
  </base-page>
</template>