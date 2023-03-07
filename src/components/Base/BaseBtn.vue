<template>
  <div>
    <v-btn
    flat
    :color="color"
    :size="getButtonSize"
    :block="block"
    :disabled="disabled"
    :rounded="rounded"
    :to="to"
    class="pa-1"
    @click="handleClick()">
    <slot />
  </v-btn>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  color: {
    type: String,
    default: 'primary'
  },
  small: {
    type: Boolean,
    default: undefined
  },
  large: {
    type: Boolean,
    default: undefined
  },
  block: {
    type: Boolean,
    default: undefined
  },
  tonal: {
    type: Boolean,
    default: undefined
  },
  elevated: {
    type: Boolean || String,
    default: undefined
  },
  plain: {
    type: Boolean,
    default: undefined
  },
  flat: {
    type: Boolean,
    default: undefined
  },
  text: {
    type: Boolean,
    default: undefined
  },
  outlined: {
    type: Boolean,
    default: undefined
  },
  rounded: {
    type: Boolean,
    default: undefined
  },
  disabled: {
    type: Boolean,
    default: undefined
  },
  to: {
    type: String,
    default: undefined
  }
});

const emit = defineEmits([ 'click' ]);

// computed

const getButtonSize = computed(() => {
  if (props.small) {
    return 'small';
  } else if (props.large) {
    return 'large';
  } else {
    return 'medium';
  }
});

// methods

function handleClick() {
  // emit click event
  emit('click')
}
</script>