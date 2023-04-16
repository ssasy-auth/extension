<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from 'vuetify/lib/framework.mjs';
import BaseCard from '../base/BaseCard.vue';

const props = defineProps({
  message: {
    type: String,
    required: true
  },

  htmlIsh: {
    type: Boolean,
    default: false
  },

  color: {
    type: String,
    default: 'primary'
  }
})

const isDark = computed(() => {
  return useTheme().global.name.value === 'dark'
})

const getOutline = computed<boolean>(() => {
  return isDark.value ? true : false
})
</script>

<template>
  <base-card
    :outlined="getOutline"
    :color="props.color">
    <v-card-text>
      <span
        v-if="props.htmlIsh"
        v-html="props.message" />
      <span v-else>{{ props.message }}</span>
    </v-card-text>
  </base-card>
</template>
