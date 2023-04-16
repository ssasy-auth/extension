<script setup lang="ts">
import type { ActionItem } from '~/components/base/BaseCard.vue';
import BasePage from '~/components/base/BasePage.vue';
import BaseBtn from '~/components/base/BaseBtn.vue';

const options: ActionItem[] = [
  {
    label: 'Key',
    to: '/key',
    icon: '$mdi-key'
  },
  {
    label: 'Settings',
    to: '/settings',
    icon: '$mdi-cog'
  }
];

</script>

<template>
  <base-page title="Home">
    <v-row justify="center">
      <v-col
        v-for="option in options"
        :key="option.label"
        cols="7"
        md="4"
        class="mt-1">
        <base-btn
          block
          extra-large
          :to="option.to">
          <v-row
            justify="space-between"
            style="width: 100%;">
            <v-col>
              {{ option.label }}
            </v-col>

            <v-col>
              <v-icon
                v-if="option.icon"
                :icon="option.icon"/>
            </v-col>
          </v-row>
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