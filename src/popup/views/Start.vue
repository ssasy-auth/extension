<!-- login user or redirect them to setup.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useMessenger } from '~/composables/useMessenger';
import { OptionPage, PopupPage } from '~/utils/browser.js';
import BasePage from '~/components/base/BasePage.vue';
import BaseBtn from '~/components/base/BaseBtn.vue';

const route = useRoute();
const { broadcastPublicKeyResponse } = useMessenger();

const origin = ref<string | undefined>(route.query.origin as string);

function goToSetup(){
  if(origin.value){
    broadcastPublicKeyResponse(null);
    OptionPage.open();
    PopupPage.close();
  } 
  
  else {
    OptionPage.open();
    PopupPage.close();
  }
}
</script>

<template>
  <base-page title="Getting started">
    <v-row justify="center">
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