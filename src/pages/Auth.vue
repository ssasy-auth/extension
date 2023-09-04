<!-- login user or redirect them to setup.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { LocationQuery } from 'vue-router';
import {
  useSessionStore,
  useWalletStore,
  useNotificationStore
} from '~/stores';
import BasePage from '~/components/base/BasePage.vue';
import InfoCard from '~/components/cards/InfoCard.vue';
import VaultAuthForm from '~/components/forms/VaultAuthForm.vue';
import type { PrivateKey } from '@ssasy-auth/core';

const route = useRoute();
const router = useRouter();
const notificationStore = useNotificationStore();

const sessionTimedOut = ref<boolean>(route.query.timeout === 'true');

async function setSession(privateKey: PrivateKey) {
  const walletStore = useWalletStore();
  const sessionStore = useSessionStore();

  try {
    // set wallet
    await walletStore.setWallet(privateKey);

    // extract public key
    const publicKey = await walletStore.getPublicKey();

    // set session
    await sessionStore.setSession(publicKey);

    // kill the wallet
    walletStore.reset();
  } catch (error) {
    const message = (error as Error).message || 'Failed to set session';
    return notificationStore.error('Authentication', message, { toast: true });
  }

  let redirectPath: string | null | undefined = router.currentRoute.value.query.redirect as string;
  let redirectQuery: LocationQuery = {
    ...router.currentRoute.value.query,
    redirect: null
  };

  return router.push({
    path: redirectPath || '/',
    query: redirectQuery
  });
}
</script>

<template>
  <base-page title="Start Page">
    <v-row justify="center">
      <v-col
        cols="10"
        md="6">
        <vault-auth-form @input="setSession">
          <template #header>
            <info-card
              v-if="sessionTimedOut"
              color="warning">
              <p>
                Your session has timed out. Please login again to continue.
              </p>
            </info-card>
            <info-card v-else>
              <p>
                Please login to continue.
              </p>
            </info-card>
          </template>
        </vault-auth-form>
      </v-col>
    </v-row>
  </base-page>
</template>