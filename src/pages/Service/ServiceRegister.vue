<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { SsasyMessenger } from '~/common/logic';
import { useSessionStore, useNotificationStore } from '~/common/stores';
import { EncoderModule } from '@this-oliver/ssasy';
import type { GenericKey } from '@this-oliver/ssasy';
import type { ActionItem } from '~/components/Base/BaseCard.vue';
import BasePage from '~/components/Base/BasePage.vue';
import BaseCard from '~/components/Base/BaseCard.vue';

const route = useRoute();
const router = useRouter();
const error = ref<string | undefined>(undefined);
const origin = ref<string | undefined>(route.query.origin as string);
const publicKeyString = ref<string | undefined>(undefined);

const options: ActionItem[] = [
  {
    label: 'Accept',
    action: async () => {
      console.log('Accept');

      try {
        if(origin.value === undefined){
          throw new Error('Origin is undefined');
        }

        if(publicKeyString.value === undefined){
          throw new Error('Public key is undefined');
        }
        
        SsasyMessenger.broadcastPublicKeyResponse(origin.value, publicKeyString.value);
      } catch (error) {
        const notificationStore = useNotificationStore();
        throw notificationStore.error('Service Registration', (error as Error).message || 'Failed to approve registration request.')
      }

    }
  },
  {
    label: 'Reject',
    action: () => {
      console.log('Reject');

      try {
        if(origin.value === undefined){
          throw new Error('Origin is undefined');
        }
        
        else {
          SsasyMessenger.broadcastPublicKeyResponse(origin.value, null);
        }
        
      } catch (error) {
        const notificationStore = useNotificationStore();
        throw notificationStore.error('Service Registration', (error as Error).message || 'Failed to reject registration request.')
      }
    }
  }
];

onMounted(async () => {
  const notificationStore = useNotificationStore();
  
  try {
    // set public key
    const sessionStore = useSessionStore();

    if(sessionStore.verifySession()){
      const rawPublic = sessionStore.session?.publicKey;
      publicKeyString.value = await EncoderModule.encodeKey(rawPublic as GenericKey);
    } 
    
    // if no session, redirect to login
    else {
      
      return router.push({ 
        path: '/auth', 
        query: {
          ...route.query,
          redirect: route.path
        } 
      });
    }

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