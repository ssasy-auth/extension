<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useSettingStore } from '~/stores';
import AppBar from '~/components/AppBar.vue';
import AppFooter from '~/components/AppFooter.vue';
import AppNotification from '~/components/AppNotification.vue';

type Theme = 'AppTheme' | 'AppThemeDark';

const settingStore = useSettingStore();
const theme = ref<Theme>(settingStore.setting.darkMode ? 'AppThemeDark' : 'AppTheme');

watch(() => settingStore.setting.darkMode, (value) => {
  theme.value = value ? 'AppThemeDark' : 'AppTheme';
});

onMounted(async () => {
  const darkMode: boolean = await settingStore.isDarkMode();
  theme.value = darkMode ? 'AppThemeDark' : 'AppTheme';
})
</script>

<template>
  <v-app
    id="app-popup"
    :theme="theme">
    <app-bar />
    <app-notification />
    
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