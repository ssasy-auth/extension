<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { PopupPage } from '~/utils/browser';
import { useMessenger } from '~/composables/useMessenger';
import Logo from '~/components/Logo.vue';
import BaseBtn from './base/BaseBtn.vue';

const route = useRoute();
const router = useRouter();
const { broadcastPublicKeyResponse, broadcastChallengeResponse } = useMessenger();

const inRoot = computed(() => {
  return route.path === '/';
});

const inAuth = computed(() => {
  return route.path.includes('/auth');
});

const inAuthRequest = computed(() => {
  return route.path.includes('/request');
});

function goBack() {
  if(
    inRoot.value ||
    inAuth.value
  ){
    PopupPage.close();
  }

  else if (inAuthRequest.value) {
    broadcastPublicKeyResponse(null, 'Cancelled by user');
    broadcastChallengeResponse(null, 'Cancelled by user');
    PopupPage.close();
  }

  else{
    router.go(-1);
  }
}
</script>

<template>
  <v-app-bar
    id="bar-wrapper"
    flat 
    rounded="b-lg">
    <base-btn
      v-if="!inRoot"
      id="bar-left"
      small
      rounded="pill"
      @click="goBack">
      <v-icon icon="$mdi-arrow-left" />
    </base-btn>
    
    <logo id="bar-center"/>
  </v-app-bar>
</template>

<style scoped>
#bar-container {
  display: flex;
  justify-content: space-between;
}

#bar-left {
  position: fixed;
  left: 0;
}

#bar-center {
  margin: 0 auto;
}
</style>