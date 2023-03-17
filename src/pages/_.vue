<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import BasePage from '~/components/Base/BasePage.vue';

const route = useRoute();
const path = ref<string | undefined>(route.path);
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

      <v-col
        v-if="path"
        cols="9"
        md="6">
        <p>
          The page <code>{{ path }}</code> does not exist.
        </p>
      </v-col>
    </v-row>
  </base-page>
</template>

<style scoped>
#error {
  padding-top: 50px;
  text-align: center;
}

#error h1 {
  font-weight: bold;
  font-size: 1.75rem;
}

/* bigger screen */
@media (min-width: 960px) {
  #error {
    padding-top: 100px;
  }
}

</style>