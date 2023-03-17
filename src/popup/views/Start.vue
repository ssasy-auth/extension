<!-- login user or redirect them to setup.vue -->
<script setup lang="ts">
import { OptionPage, PopupPage } from '~/common/utils/browser.js';
import BasePage from '~/components/Base/BasePage.vue';
import BaseBtn from '~/components/Base/BaseBtn.vue';

function goToSetup(){
  OptionPage.open();
  PopupPage.close();
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