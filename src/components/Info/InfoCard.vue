<script setup lang="ts">
import BaseCard from '../Base/BaseCard.vue';

const props = defineProps({
  color: {
    type: String,
    default: 'info'
  }
})

</script>

<template>
  <base-card
    text
    :color="props.color">
    <slot name="icon">
      <mdi-information-outline />
    </slot>
    <slot></slot>
  </base-card>
</template>
