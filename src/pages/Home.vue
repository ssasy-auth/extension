<script setup lang="ts">
import type { ActionItem } from '~/components/Base/BaseCard.vue';
import BasePage from '~/components/Base/BasePage.vue';
import BaseBtn from '~/components/Base/BaseBtn.vue';

const options: ActionItem[] = [
  {
    label: 'Key',
    to: '/key'
  },
  {
    label: 'Settings',
    to: '/settings'
  }
];
</script>

<template>
  <base-page title="Home">
    <v-row justify="center">
      <v-col cols="11" md="6" class="home-welcome text-center">
        <h1>🎉 Welcome!</h1>
      </v-col>

      <v-divider class="opacity-0" />

      <v-col v-for="option in options" :key="option.label" cols="7" md="4" class="mt-1">
        <base-btn large block :to="option.to">
          {{ option.label }}
        </base-btn>
      </v-col>
    </v-row>
  </base-page>
</template>

<style scoped>
.home-welcome {
  top: 30%;
}
</style>