<!-- generate key or import -->
<script setup lang="ts">
import { useRouter } from 'vue-router';
import BasePage from '~/components/base/BasePage.vue';
import BaseCard from '~/components/base/BaseCard.vue';
import type { ActionItem } from '~/components/base/BaseCard.vue';

const router = useRouter();

interface SetupOption {
  label: string;
  description: string;
  actions: ActionItem[];
}
const options = [
  {
    label: 'Start from scratch',
    description: 'Generate a new key pair',
    actions: [
      {
        label: 'Generate keys',
        action: () => {
          router.push('/setup/key');
        }
      }
    ]
  },
  {
    label: 'Import',
    description: 'Import an existing key pair',
    actions: [
      {
        label: 'Import Key',
        action: () => {
          router.push('/setup/import');
        }
      }
    ]
  }
] as SetupOption[];

</script>

<template>
  <base-page title="Setup SSASy">
    <v-row justify="center">
      <v-col
        v-for="option in options"
        :key="option.label"
        cols="10">
        <base-card
          :title="option.label"
          :subtitle="option.description"
          :actions="option.actions" />
      </v-col>
    </v-row>
  </base-page>
</template>
