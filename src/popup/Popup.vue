<script setup lang="ts">
import AppBar from '~/components/AppBar.vue';
import AppFooter from '~/components/AppFooter.vue';

</script>

<template>
  <v-app id="app-popup">
    <app-bar />
    
    <v-main>
      <router-view />
    </v-main>

    <app-footer />
  </v-app>
</template>
