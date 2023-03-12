<script setup lang="ts">
import { computed } from 'vue';
import { inPopupPage, openOptionsPage } from '~/logic/browser';
import BaseBtn from '~/components/Base/BaseBtn.vue';

const inPopup = computed(() => inPopupPage());

</script>

<template>
  <v-footer class="popup-footer">
    <v-row
      justify="space-between"
      class="my-1"
      no-gutters>
      <v-col cols="auto">
        <p class="mt-2 opacity-50">This is the {{ $app.context }} page</p>
      </v-col>
        
      <v-col
        v-if="inPopup"
        cols="auto">
        <base-btn
          text
          @click="openOptionsPage()">
          Open Options
        </base-btn>
      </v-col>
    </v-row>
  </v-footer>
</template>

<style scoped>
.popup-footer {
  position: absolute;
  bottom: 0;
  width: 100%;
}
</style>