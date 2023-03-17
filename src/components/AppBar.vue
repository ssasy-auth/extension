<script setup lang="ts">
import { useRouter } from 'vue-router';
import { PopupPage } from '~/logic/browser';
import Logo from '~/components/Logo.vue';
import BaseBtn from './Base/BaseBtn.vue';

const router = useRouter();

function goBack() {
  if (router.currentRoute.value.path === '/') {
    PopupPage.close();
  } else {
    router.go(-1);
  }
  router.go(-1);
}
</script>

<template>
  <v-app-bar
    id="bar-wrapper"
    absolute
    flat 
    rounded="b-lg" 
    color="transparent">
    <base-btn
      v-if="$app.context === 'popup'"
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