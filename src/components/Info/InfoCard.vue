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
    <v-row>
      <v-col
        cols="1"
        class="text-center">
        <slot name="icon">
          <mdi-information-outline />
        </slot>
      </v-col>
      
      <v-col>
        <slot></slot>
      </v-col>
    </v-row>
  </base-card>
</template>
