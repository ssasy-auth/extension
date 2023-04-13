<!-- login user or redirect them to setup.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { LocationQuery } from 'vue-router';
import {
  useVaultStore,
  useSessionStore,
  useWalletStore,
  useNotificationStore
} from '~/common/stores';
import BasePage from '~/components/Base/BasePage.vue';
import AuthForm from '~/components/Auth/AuthForm.vue';

const router = useRouter();
const notificationStore = useNotificationStore();

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
        cols="10"
        md="6">
        <auth-form @input="handleLoginForm" />
      </v-col>
    </v-row>
  </base-page>
</template>