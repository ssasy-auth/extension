<!-- login user or redirect them to setup.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { LocationQuery } from 'vue-router';
import { useVaultStore, useSessionStore, useWalletStore, useNotificationStore } from '~/stores'
import BasePage from '~/components/Base/BasePage.vue';
import BaseCard from '~/components/Base/BaseCard.vue';
import AuthForm from '~/components/Auth/AuthForm.vue';

const router = useRouter();
const errorMessage= ref<string|undefined>(undefined);

async function handleLoginForm(password: string){
  const notificationStore = useNotificationStore();
  const vaultStore = useVaultStore();
  const walletStore = useWalletStore();
  const sessionStore = useSessionStore();
  
  try {
    const key = await vaultStore.getStoreKey(password);
    walletStore.setWallet(key);

    // set session
    await sessionStore.setSession(
      await walletStore.getPublicKey()
    );
  } catch (error) {
    errorMessage.value = notificationStore.error('Start Page', (error as Error).message || 'Invalid password');
  }

  // if wallet is not set, return
  if (!walletStore.wallet) {
    return;
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
        v-if="errorMessage !== undefined"
        cols="10"
        md="6">
        <base-card color="warning">
          {{ errorMessage }}
        </base-card>
      </v-col>
      <v-col
        cols="10"
        md="6">
        <auth-form @login="handleLoginForm" />
      </v-col>
    </v-row>
  </base-page>
</template>