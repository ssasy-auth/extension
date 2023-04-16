<script setup lang="ts">
import BaseCard from '../base/BaseCard.vue';

const props = defineProps({
  color: {
    type: String,
    default: undefined
  }
})

</script>

<template>
  <base-card
    tonal
    :color="props.color">
    <v-row>
      <v-col cols="1">
        <div class="mx-auto">
          <slot name="icon">
            <v-icon icon="$mdi-information-outline" />
          </slot>
        </div>
      </v-col>
      
      <v-col>
        <slot></slot>
      </v-col>
    </v-row>
  </base-card>
</template>
