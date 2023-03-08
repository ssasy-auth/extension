<!-- login user or redirect them to setup.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useVaultStore } from '~/stores/vault-store.js'
import { inPopupPage, openOptionsPage, closePopup } from '~/logic/browser';
import BasePage from '~/components/Base/BasePage.vue';
import BaseBtn from '~/components/Base/BaseBtn.vue';

const router = useRouter()
const vaultStore = useVaultStore()

function goToSetup(){
  if(inPopupPage()){
    openOptionsPage(/*{ path: '/setup' }*/) // go to setup route in options page
    closePopup()
  } else {
    router.push('/setup')
  }
}
</script>

<template>
  <base-page title="Start Page">
    <v-row
      v-if="!vaultStore.hasKey"
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
