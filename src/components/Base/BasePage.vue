<script setup lang="ts">

const props = defineProps({
  title: {
    type: String,
    defualt: undefined
  }
});

</script>

<template>
  <v-row justify="center" class="pa-1">
    <v-col v-if="props.title" cols="auto">
      <h1>{{ props.title }}</h1>
    </v-col>
    <v-col cols="12" />
    <v-col>
      <slot />
    </v-col>
  </v-row>
</template>