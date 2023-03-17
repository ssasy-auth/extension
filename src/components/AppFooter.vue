<script setup lang="ts">
import { OptionPage, PopupPage } from '~/logic/browser';
import BaseBtn from '~/components/Base/BaseBtn.vue';

function goToOptionPage() {
  OptionPage.open();
  PopupPage.close();
}

</script>

<template>
  <v-footer
    app
    class="popup-footer">
    <v-row
      justify="space-between"
      class="my-1"
      no-gutters>
      <v-col cols="auto">
        <p class="mt-2 opacity-50">This is the {{ $app.context }} page</p>
      </v-col>
        
      <v-col
        v-if="$app.context === 'popup'"
        cols="auto">
        <base-btn
          text
          @click="goToOptionPage()">
          Open Options
        </base-btn>
      </v-col>
    </v-row>
  </v-footer>
</template>
