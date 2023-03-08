<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { inPopupPage, closePopup } from '~/logic/browser';
import Logo from '~/components/Logo.vue';
import BaseBtn from './Base/BaseBtn.vue';

const router = useRouter();

const inPopup = computed(() => inPopupPage());

function goBack() {
  if (router.currentRoute.value.path === '/') {
    closePopup();
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
      v-if="inPopup"
      id="bar-left"
      small
      icon
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