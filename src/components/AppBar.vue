<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { PopupPage } from '~/common/utils/browser';
import { SsasyMessenger } from '~/common/logic';
import Logo from '~/components/Logo.vue';
import BaseBtn from './Base/BaseBtn.vue';

const router = useRouter();
const route = useRoute();

const inRoot = computed(() => {
  return route.path === '/';
});

const inAuth = computed(() => {
  return route.path.includes('/auth');
});

const inSetup = computed(() => {
  return route.path.includes('/setup');
});

const inAuthRequest = computed(() => {
  return route.path.includes('/request');
});

function goBack() {
  if(
    inRoot.value ||
    inAuth.value ||
    inSetup.value
  ){
    PopupPage.close();
  }

  else if (inAuthRequest.value) {
    SsasyMessenger.broadcastPublicKeyResponse(null, 'Cancelled by user');
    SsasyMessenger.broadcastChallengeResponse(null, 'Cancelled by user');
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
      <material-symbols-arrow-back />
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