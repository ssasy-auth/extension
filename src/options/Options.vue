<script setup lang="ts">
import { ref, watch } from 'vue';
import { useSettingStore } from '~/common/stores';
import AppBar from '~/components/AppBar.vue';
import AppFooter from '~/components/AppFooter.vue';

type Theme = 'AppTheme' | 'AppThemeDark';

const settingStore = useSettingStore();
const theme = ref<Theme>(settingStore.getDarkMode ? 'AppThemeDark' : 'AppTheme');

watch(() => settingStore.getDarkMode, (value) => {
  theme.value = value ? 'AppThemeDark' : 'AppTheme';
});

</script>

<template>
  <v-app
    id="app-options"
    :theme="theme">
    <app-bar />
    
    <v-main>
      <router-view />
    </v-main>

    <app-footer />
  </v-app>
</template>
