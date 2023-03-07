<script setup lang="ts">
import { ref } from 'vue';
import { storageDemo } from '~/logic/storage'
import BaseBtn from '~/components/Base/BaseBtn.vue';
import AppBar from '~/components/AppBar.vue';

const name = ref('empty wallet') ;

function openOptionsPage() {
  // eslint-disable-next-line no-undef
  browser.runtime.openOptionsPage()
}
</script>

<template>
  <v-layout id="app-popup">
    <app-bar />

    <v-main>
      <div>Popup</div>
      <SharedSubtitle />
    
      <base-btn class="mt-2" @click="openOptionsPage">
        Open Options
      </base-btn>
      <div class="mt-2">
        <span class="opacity-50">Wallet:</span> {{ name }}
      </div>
      <div class="mt-2">
        <span class="opacity-50">Storage:</span> {{ storageDemo }}
      </div>
    </v-main>
  </v-layout>
</template>
