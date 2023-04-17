<!-- generate key or import -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useKeyStore } from '~/stores/key-store';
import type { PrivateKey } from '@ssasy-auth/core';
import BasePage from '~/components/base/BasePage.vue';
import BaseBtn from '~/components/base/BaseBtn.vue';
import KeyCard from '~/components/cards/KeyCard.vue';
import InfoCard from '~/components/cards/InfoCard.vue';
import InfoCardBackup from '~/components/cards/InfoCardBackup.vue';
import InfoCardNeverShareKey from '~/components/cards/InfoCardNeverShareKey.vue';

const keyStore = useKeyStore();

const key = ref<PrivateKey | undefined>(undefined);
const termsAccepted = ref<boolean>(false);
const loading = ref<boolean>(false);

async function generateKey(){
  key.value = await keyStore.createPrivateKey();
}

onMounted(async () => {
  loading.value = true;
  await generateKey();
  loading.value = false;
});
</script>

<template>
  <base-page title="Key Generation">
    <v-row
      v-if="key"
      justify="center"
      no-gutters>
      
      <v-col
        cols="12" 
        md="6">
        <key-card
          :ssasy-key="key"
          :show-actions="true"
          :show-secrets="true">
          <template #hints>
            <info-card-never-share-key class="mt-2" />
            <info-card-backup class="mt-2" />
            <v-switch
              v-model="termsAccepted"
              color="primary"
              label="I understand why I should back up my key and never share it with anyone."
              class="mt-2"
              inset></v-switch>
          </template>
        </key-card>
      </v-col>
      
      <v-divider class="border-opacity-0" />
      
      <v-col cols="auto">
        <base-btn
          large
          color="success"
          :disabled="!termsAccepted"
          to="/setup/storage">
          Next
        </base-btn>
      </v-col>
    </v-row>

    <v-row
      v-else
      justify="center">
      <v-col
        cols="auto"
        class="text-center">
        <info-card>
          <p>
            Generating a new key pair can take a while.
            Please be patient.
          </p>
        </info-card>

        <v-skeleton-loader
          class="mt-2"
          color="primary"
          type="card" />
      </v-col>
    </v-row>
  </base-page>
</template>
