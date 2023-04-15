<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import BasePage from '~/components/Base/BasePage.vue';
import BaseCard from '~/components/Base/BaseCard.vue';

const route = useRoute();
const path = ref<string | undefined>(route.path);
</script>

<template>
  <base-page title="Oops!">
    <v-row
      id="error"
      justify="center">
      <v-col cols="auto">
        <base-card>
          <v-card-title>
            Something went wrong
          </v-card-title>

          <v-card-text v-if="path">
            <p>
              The page <code>{{ path }}</code> does not exist.
            </p>
          </v-card-text>
          
          <v-card-text v-else>
            <p>
              It seems like you have found a bug. Please report it at <a
                href="https://github.com/ssasy-auth/extension/issues/new"
                target="_blank">@ssasy-auth/extension</a>.
            </p>
          </v-card-text>
        </base-card>
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