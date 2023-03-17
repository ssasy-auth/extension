<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    defualt: undefined
  }
});

const isPopup = computed(() => {
  return window.location.pathname.includes('popup');
});

const getStyle = computed(() => {
  const styles = [ ];

  if(isPopup.value) {
    styles.push('padding-bottom: 40px');
  }


  return styles.join(' ');
});
</script>

<template>
  <div>
    <div
      v-if="props.title"
      class="text-center my-1">
      <h1>{{ props.title }}</h1>
    </div>

    <v-row
      justify="center"
      class="pa-1"
      :style="getStyle">
      <v-col>
        <slot />
      </v-col>
    </v-row>
  </div>
</template>
