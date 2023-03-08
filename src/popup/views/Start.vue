<!-- login user or redirect them to setup.vue -->
<script setup lang="ts">
import { useVaultStore } from '~/stores/vault-store.js'
import { openOptionsPage } from '~/logic/browser';
import BasePage from '~/components/Base/BasePage.vue';
import BaseBtn from '~/components/Base/BaseBtn.vue';
import FormLogin from '~/components/FormLogin.vue';

const vaultStore = useVaultStore()

function handleLoginForm(password: string){
  console.log(`password: ${password}`)

  // TODO: decrypt vault with password
}

function openSetupOption(){
  openOptionsPage({ path: '/setup' }) // go to setup route in options page
}
</script>

<template>
  <base-page title="Start Page">
    <v-row v-if="vaultStore.hasKey">
      <v-col cols="10">
        <form-login @login="handleLoginForm" />
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
          @click="openSetupOption()">
          Setup Wallet
        </base-btn>
      </v-col>
    </v-row>
  </base-page>
</template>