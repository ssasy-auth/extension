<script setup lang="ts">
import { ref } from 'vue';
import { storageDemo } from '~/logic/storage'
import AppBar from '~/components/AppBar.vue';
import BaseInput from '~/components/Base/BaseInput.vue';
import BaseBtn from '~/components/Base/BaseBtn.vue';

const nameForm = ref('')

function updateName() {
  console.log('updateName', nameForm.value)
}
</script>

<template>
  <v-app id="app-options">
    <app-bar />
    <v-main>
      <v-row justify="center">
        <v-col cols="auto">
          Options
        </v-col>
        <v-divider class="mx-2"/>
        <v-col cols="auto">
          <SharedSubtitle />
        </v-col>
        <v-divider class="mx-2"/>
        <v-col cols="10" md="5">
          <base-input v-model="nameForm" place-holder="wallet name" class="mt-2" />
          <base-btn class="mt-2" @click="updateName">
            Update Name
          </base-btn>
        </v-col>
        <v-divider class="mx-2"/>
        <v-col cols="10" md="5">
          <input v-model="storageDemo" class="border border-gray-400 rounded px-2 py-1 mt-2">
        </v-col>
      </v-row>
    </v-main>
  </v-app>
  
</template>
