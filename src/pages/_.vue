<script setup lang="ts">
import BasePage from '~/components/Base/BasePage.vue';
</script>

<template>
  <base-page title="Oops!">
    <v-row
      id="error"
      justify="center">
      <v-col
        cols="9"
        md="6">
        <h1>Something went wrong</h1>
      </v-col>
    </v-row>
  </base-page>
</template>

<style scoped>
#error {
  padding-top: 100px;
  text-align: center;
}

#error h1 {
  font-weight: bold;
  font-size: 1.75rem;
}
</style>