<script setup lang="ts">
import type { ComputedRef } from 'vue';
import { computed } from 'vue';

const props = defineProps({
  color: {
    type: String,
    default: undefined
  },
  block: {
    type: Boolean,
    default: undefined
  },
  elevation: {
    type: String,
    default: undefined
  },
  /* sizes */
  small: {
    type: Boolean,
    default: undefined
  },
  large: {
    type: Boolean,
    default: undefined
  },
  /* styles */
  flat: {
    type: Boolean,
    default: undefined
  },
  outlined: {
    type: Boolean,
    default: true
  },
  text: {
    type: Boolean,
    default: false
  },
  icon: {
    type: Boolean,
    default: false
  },
  rounded: {
    type: String,
    default: undefined
  },
  /* actionability */
  disabled: {
    type: Boolean,
    default: undefined
  },
  to: {
    type: String,
    default: undefined
  },
  hideFromTab: {
    type: Boolean,
    default: undefined
  }
});

const emit = defineEmits([ 'click' ]);

type ButtonStyle = 'outlined' | 'tonal' | 'plain' | 'text';
const getButtonStyle: ComputedRef<ButtonStyle | undefined> = computed(() => {
  if (props.outlined === true) {
    return 'outlined';
  } else if (props.text === true) {
    return 'text';
  } else {
    return undefined
  }
});

type ButtonSize = 'small' | 'medium' | 'large';
const getButtonSize: ComputedRef<ButtonSize> = computed(() => {
  if (props.small) {
    return 'small';
  } else if (props.large) {
    return 'large';
  } else {
    return 'medium';
  }
});

const getTabIndex = computed(() => {
  if (props.hideFromTab) {
    return '-1';
  } else {
    return undefined;
  }
});

function handleClick() {
  // emit click event
  emit('click')
}
</script>

<template>
  <v-btn
    flat
    :icon="props.icon"
    :elevation="props.elevation"
    :color="props.color"
    :block="props.block"
    :disabled="props.disabled"
    :rounded="props.rounded"
    :to="props.to"
    :size="getButtonSize"
    :variant="getButtonStyle"
    :tabindex="getTabIndex"
    class="pa-1"
    @click="handleClick()">
    <slot />
  </v-btn>
</template>