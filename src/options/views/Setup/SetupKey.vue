<!-- generate key or import -->
<script setup lang="ts">
import type { PrivateKey } from '@this-oliver/ssasy';
import { reactive, computed } from 'vue';
import { KeyChecker } from '@this-oliver/ssasy';
import { useKeyStore } from '~/stores/key-store.js';
import BasePage from '~/components/Base/BasePage.vue';
import BaseBtn from '~/components/Base/BaseBtn.vue';
import KeyViewer from '~/components/KeyViewer.vue';

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
        <key-viewer
          :ssasy-key="data.key"
          :show-secrets="true" />
      </v-col>
      <v-divider />
      <v-col
        cols="12"
        md="6"
        class="mt-1">
        <base-card 
          color="warning"
          :outlined="false">
          <v-card-text>
            <blockquote>
              <p>
                Your key is used to securely register and login to websites. Losing or exposing it can result in unauthorized access to your personal information and accounts.
                Please export your key and store it somewhere safe and private.
              </p>
            </blockquote>
          </v-card-text>
        </base-card>
        <v-switch
          v-model="data.termsAccepted"
          color="primary"
          :label="data.termsAccepted ? 'I understand' : 'I do not understand'"
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
