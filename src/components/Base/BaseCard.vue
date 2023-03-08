<script setup lang="ts">
import { computed } from 'vue';
import type { PropType, ComputedRef } from 'vue';
import BaseBtn from './BaseBtn.vue';

/**
 * Actions to be displayed in the card footer.
 */
export interface ActionItem {
  label: string;
  description?: string;
  color?: string;
  disabled?: boolean;
  outlined?: boolean;
  hint?: string;
  action: () => void;
}
const props = defineProps({
  title: {
    type: String,
    default: undefined
  },
  subtitle: {
    type: String,
    default: undefined
  },
  color: {
    type: String,
    default: undefined
  },
  flat: {
    type: Boolean,
    default: true
  },
  outlined: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  actions: {
    type: Array as PropType<ActionItem[]>,
    default: () => []
  }
})

type CardStyle = 'flat' | 'outlined' | 'text' | 'elevated' | 'tonal' | 'plain';
const getCardStyle: ComputedRef<NonNullable<CardStyle> | undefined> = computed(() => {
  if(props.outlined === true){
    return 'outlined';
  } else {
    return undefined
  }
});

const getActions: ComputedRef<ActionItem[]> = computed(() => {
  return props.actions.map((item) => {
    return {
      ...item,
      action: () => {
        item.action();
      }
    };
  });
})
</script>

<template>
  <v-card
    :title="props.title"
    :subtitle="props.subtitle"
    :flat="props.flat"
    :color="props.color"
    :variant="getCardStyle" >
    <slot />

    <template
      #actions
      v-if="getActions.length > 0" >
      <base-btn
        v-for="item in getActions"
        :key="item.label"
        :color="item.color"
        :hint="item.hint"
        :outlined="item.outlined"
        :loading="props.loading"
        @click="item.action" >
        {{ item.label }}
      </base-btn >
    </template >
  </v-card >
</template>