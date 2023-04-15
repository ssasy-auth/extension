<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSessionStore } from '~/common/stores';
import type { PrivateKey } from '@ssasy-auth/core';
import BasePage from '~/components/Base/BasePage.vue';
import VaultAuthForm from '~/components/Auth/VaultAuthForm.vue';
import KeyCard from '~/components/Key/KeyCard.vue';
import MessageCard from '~/components/MessageCard.vue';
import InfoCard from '~/components/Info/InfoCard.vue';

type KeyTab = 'public' | 'private';
const tabs: KeyTab[] = [ 'public', 'private' ];

const route = useRoute();
const router = useRouter();
const sessionStore = useSessionStore();
const privateKey = ref<PrivateKey | undefined>(undefined);

const tab = ref<KeyTab>(_getRouteTab() || 'public');

function _getRouteTab(): KeyTab | undefined {
  // get query from route
  const tab = route.query.tab as KeyTab;
  
  if(tab && tabs.includes(tab)) {
    return tab;
  }

  return undefined;
}

// update route query
watch(tab, (newTab) => {
  router.replace({
    query: {
      ...router.currentRoute.value.query,
      tab: newTab
    }
  });
});
</script>

<template>
  <base-page title="Keys">
    <v-row justify="center">
      <v-col
        cols="11"
        md="6">
        <v-tabs
          v-model="tab"
          bg-color="primary">
          <v-tab
            v-for="tab in tabs"
            :key="tab"
            :value="tab">{{ tab }}</v-tab>
        </v-tabs>
      </v-col>

      <v-divider class="border-opacity-0" />

      <v-col
        cols="11"
        md="6">
        <v-window v-model="tab">
          <v-window-item :value="`${'public' as KeyTab}`">
            <key-card
              v-if="sessionStore.session?.publicKey"
              :ssasy-key="sessionStore.session?.publicKey"
              :show-secrets="true"
              :show-actions="true" />
            <message-card
              v-else
              color="secondary"
              message="Can't find your public key" />
          </v-window-item>

          <v-window-item :value="`${'private' as KeyTab}`">
            <div v-if="!privateKey">
              <info-card>
                <p>
                  Enter your password to export your vault key.
                </p>
              </info-card>
              <vault-auth-form @input="(key) => privateKey = key" />
            </div>
            <key-card
              v-else
              :ssasy-key="privateKey"
              :show-secrets="true"
              :show-actions="true" />
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </base-page>
</template>
