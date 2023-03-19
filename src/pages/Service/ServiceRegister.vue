<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { SsasyMessenger, MessageType } from '~/common/logic';
import { PopupPage } from '~/common/utils';
import { useVaultStore, useSessionStore, useNotificationStore } from '~/common/stores';
import type { GenericMessage, ChallengeRequest } from '~/common/logic';
import type { ActionItem } from '~/components/Base/BaseCard.vue';
import BasePage from '~/components/Base/BasePage.vue';
import BaseCard from '~/components/Base/BaseCard.vue';

const route = useRoute();
const router = useRouter();
const loading = ref<boolean>(false);
const error = ref<string | undefined>(undefined);

const origin = ref<string | undefined>(route.query.origin as string);
const publicKeyString = ref<string | undefined>(undefined);
const challengeString = ref<string | undefined>(undefined);

const options: ActionItem[] = [
  {
    label: 'Accept',
    action: async () => {
      await approvePublicKeyRequest();
    }
  },
  {
    label: 'Reject',
    action: () => {
      rejectPublicKeyRequest();
    }
  }
];

async function approvePublicKeyRequest(){
  loading.value = true;
  try {
    if(origin.value === undefined){
      throw new Error('Origin is undefined');
    }

    if(publicKeyString.value === undefined){
      throw new Error('Public key is undefined');
    }
    
    SsasyMessenger.broadcastPublicKeyResponse(publicKeyString.value);

    loading.value = false;
  } catch (error) {
    loading.value = false;
    PopupPage.close();

    const notificationStore = useNotificationStore();
    throw notificationStore.error('Service Registration', (error as Error).message || 'Failed to approve registration request.')
  }
}

function rejectPublicKeyRequest(){
  loading.value = true;
  try {
    if(origin.value === undefined){
      throw new Error('Origin is undefined');
    }
        
    else {
      SsasyMessenger.broadcastPublicKeyResponse(null);
    }

    PopupPage.close();

    loading.value = false;
  } catch (error) {
    loading.value = false;
    PopupPage.close();

    const notificationStore = useNotificationStore();
    throw notificationStore.error('Service Registration', (error as Error).message || 'Failed to reject registration request.')
  }
}

// watch for challenge and respond
watch(challengeString, async (challenge) => {
  if(challenge === undefined){
    return;
  }

  console.info('[ext-background] recieved new challenge', challenge);
});

onMounted(async () => {
  const notificationStore = useNotificationStore();
  
  try {
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
        const response: ChallengeRequest = {
          origin: msg.origin,
          type: MessageType.RequestSolution,
          challenge: msg.challenge
        };

        console.info('[ext-background] recieved challenge to content script', response);

        // set challenge
        challengeString.value = response.challenge;
      }
    });

  } catch (error) {
    throw notificationStore.error('Service Registration', (error as Error).message || 'Failed to setup public key.')
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
        cols="11"
        md="6">
        <base-card
          title="Registration"
          :actions="options"
          class="pa-1">
          <p>
            {{ origin }} is requesting your public key.
          </p>
        </base-card>
      </v-col>
    </v-row>
  </base-page>
</template>