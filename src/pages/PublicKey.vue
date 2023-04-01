<script setup lang="ts">
import { computed } from 'vue';
import { useSessionStore } from '~/common/stores';
import type { ComputedRef } from 'vue';
import type { RawKey } from '@ssasy-auth/core';
import KeyViewer from '~/components/Key/KeyViewer.vue';

const sessionStore = useSessionStore();

const key = computed(() => {
  return sessionStore.session?.publicKey as RawKey;
}) as ComputedRef<RawKey>;

</script>

<template>
  <v-row justify="center">
    <v-col
      cols="10"
      md="6">
      <key-viewer
        :ssasy-key="key"
        :show-secrets="true"
        :show-actions="true" />
    </v-col>
  </v-row>
</template>
