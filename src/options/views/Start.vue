<!-- login user or redirect them to setup.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useVaultStore } from '~/stores/vault-store.js'
import { useNotificationStore } from '~/stores/app-store';
import { inPopupPage, openOptionsPage, closePopup } from '~/logic/browser';
import BasePage from '~/components/Base/BasePage.vue';
import BaseBtn from '~/components/Base/BaseBtn.vue';
import AuthForm from '~/components/Auth/AuthForm.vue';

const router = useRouter()
const hasKey = ref(false)

const vaultStore = useVaultStore();
const notificationStore = useNotificationStore();

async function handleLoginForm(password: string){
  try {
    const key = await vaultStore.getStoreKey(password)
    console.log({ key })
  } catch (error) {
    notificationStore.error('Start Page', (error as Error).message || 'Invalid password')
  }
}

function goToSetup(){
  if(inPopupPage()){
    openOptionsPage()
    closePopup()
  } else {
    router.push('/setup')
  }
}

onMounted(() => {
  const vaultStore = useVaultStore();
  hasKey.value = vaultStore.hasKey;
  
  if(!hasKey.value){
    
    if(inPopupPage()){
      openOptionsPage()
      closePopup()
    } else {
      router.push('/setup')
    }
  }
});
</script>

<template>
  <base-page title="Start Page">
    <v-row
      v-if="hasKey"
      justify="center">
      <v-col
        cols="10"
        md="6">
        <auth-form @login="handleLoginForm" />
      </v-col>
    </v-row>
    <v-row
      v-else
      justify="center">
      <v-col
        cols="10"
        class="text-center">
        You need to setup your wallet first.
      </v-col>
      <v-divider />
      <v-col cols="auto">
        <base-btn
          large
          @click="goToSetup()">
          Setup Wallet
        </base-btn>
      </v-col>
    </v-row>
  </base-page>
</template>