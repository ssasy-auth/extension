<script setup lang="ts">

const props = defineProps({
  title: {
    type: String,
    defualt: undefined
  }
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
      class="pa-1">
      <v-col>
        <slot />
      </v-col>
    </v-row>
  </div>
</template>