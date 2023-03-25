<script setup lang="ts">
import { ref, watch } from 'vue';
import { useSettingStore } from '~/common/stores';
import AppBar from '~/components/AppBar.vue';
import AppFooter from '~/components/AppFooter.vue';

type Theme = 'AppTheme' | 'AppThemeDark';

const settingStore = useSettingStore();
const theme = ref<Theme>(settingStore.darkMode ? 'AppThemeDark' : 'AppTheme');

watch(() => settingStore.darkMode, (value) => {
  theme.value = value ? 'AppThemeDark' : 'AppTheme';
});
</script>

<template>
  <v-app id="app-popup" :theme="theme">
    <app-bar />
    
    <v-main>
      <router-view />
    </v-main>

    <app-footer />
  </v-app>
</template>

<style scoped>
#app-popup {
  padding: 5px;

  height: 600px;
  max-height: 600px;
  min-height: 600px;
  
  width: 400px;
  max-width: 400px;
  min-width: 400px;

  /* allow overflow vertical scroll */
  overflow-y: auto;
  overflow-x: hidden;
}
</style>