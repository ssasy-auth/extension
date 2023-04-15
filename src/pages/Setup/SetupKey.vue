<!-- generate key or import -->
<script setup lang="ts">
import type { PrivateKey } from '@ssasy-auth/core';
import { reactive, computed } from 'vue';
import { KeyChecker } from '@ssasy-auth/core';
import { useKeyStore } from '~/common/stores/key-store';
import BasePage from '~/components/Base/BasePage.vue';
import BaseBtn from '~/components/Base/BaseBtn.vue';
import KeyCard from '~/components/Key/KeyCard.vue';
import InfoCardBackup from '~/components/Info/InfoCardBackup.vue';

const keyStore = useKeyStore();

const data = reactive({
  key: {} as PrivateKey,
  termsAccepted: false
});

const isValidKey = computed(() => {
  return KeyChecker.isAsymmetricKey(data.key);
});

async function generateKey(){
  data.key = await keyStore.createPrivateKey();
}
</script>

<template>
  <base-page title="Key Generation">
    <v-row
      v-if="!isValidKey"
      justify="center">
      <v-col
        cols="auto"
        class="text-center">
        <base-btn
          large
          @click="generateKey">
          Generate
        </base-btn>
      </v-col>
    </v-row>
    <v-row
      v-else
      justify="center"
      no-gutters>
      <v-col
        cols="12" 
        md="6">
        <key-card
          :ssasy-key="data.key"
          :show-secrets="true" />
      </v-col>
      <v-divider />
      <v-col
        cols="12"
        md="6"
        class="mt-1">
        <info-card-backup />
        <v-switch
          v-model="data.termsAccepted"
          color="primary"
          label="I understand"
          inset></v-switch>
      </v-col>
      <v-divider />
      <v-col cols="auto">
        <base-btn
          large
          :disabled="!data.termsAccepted"
          to="/setup/storage">
          Next
        </base-btn>
      </v-col>
    </v-row>
  </base-page>
</template>
