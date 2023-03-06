<script setup lang="ts">
import { RouterView } from "vue-router";
import AppNav from "./components/AppNav.vue";

</script>

<template>
  <v-app>
    <app-nav />
    
    <v-main>
      <router-view />
		</v-main>
	</v-app>
</template>
