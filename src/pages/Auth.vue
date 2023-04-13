<!-- login user or redirect them to setup.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { LocationQuery } from 'vue-router';
import {
  useVaultStore,
  useSessionStore,
  useWalletStore,
  useNotificationStore
} from '~/common/stores';
import BasePage from '~/components/Base/BasePage.vue';
import BaseCard from '~/components/Base/BaseCard.vue';
import AuthForm from '~/components/Auth/AuthForm.vue';

const route = useRoute();
const router = useRouter();
const notificationStore = useNotificationStore();

const sessionTimedOut = ref<boolean>(route.query.timeout === 'true');

async function handleLoginForm(password: string) {
  const vaultStore = useVaultStore();
  const walletStore = useWalletStore();
  const sessionStore = useSessionStore();

  try {
    // unwrap key
    const privateKey = await vaultStore.unwrapKey(password);

    // set wallet
    walletStore.setWallet(privateKey);

    // extract public key
    const publicKey = await walletStore.getPublicKey();

    // set session
    await sessionStore.setSession(publicKey);

    // kill the wallet
    walletStore.reset();
  } catch (error) {
    const message = (error as Error).message || 'Invalid password';
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
        v-if="sessionTimedOut"
        cols="10"
        md="6">
        <base-card>
          <p>
            Your session has timed out. Please login again to continue.
          </p>
        </base-card>
      </v-col>

      <v-divider class="border-opacity-0" />
      
      <v-col
        cols="10"
        md="6">
        <auth-form @input="handleLoginForm" />
      </v-col>
    </v-row>
  </base-page>
</template>