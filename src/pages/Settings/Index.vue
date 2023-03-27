<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useSettingStore, useNotificationStore } from '~/common/stores/app';
import type { ActionItem } from '~/components/Base/BaseCard.vue';

const settingStore = useSettingStore();
const notificationStore = useNotificationStore();

type SettingType = 'toggle' | 'action';

type SettingTab = 'system' | 'security';

interface SettingItem extends ActionItem {
  id: string;
  tab: SettingTab;
  type: SettingType;
  prompt?: string;
};

const tab = ref<SettingTab>('system');

const signatureOption = ref<SettingItem>({
  id: 'signature',
  tab: 'security',
  type: 'toggle',
  label: 'Require signature on login',
  description: 'Require services to provide a signature proving that you registered with a service before logging in (Recommended against phishing).'
});

const darkModeOption = ref<SettingItem>({
  id: 'darkMode',
  tab: 'system',
  type: 'toggle',
  label: 'Enable dark mode',
  description: 'Set the theme to dark mode.'
});

const viewLogsOption = ref<SettingItem>({
  id: 'logs',
  tab: 'system',
  type: 'action',
  label: 'View logs',
  prompt: 'View logs',
  description: 'View extension logs for your current session.',
  to: '/settings/logs'
});

const changeVaultPasswordOption = ref<SettingItem>({
  id: 'vaultPassword',
  tab: 'security',
  type: 'action',
  label: 'Edit vault password',
  prompt: 'Change password',
  description: 'Change the password used to encrypt your key.',
  color: 'error',
  to: '/settings/vault'
});

const options = computed<SettingItem[]>(() => {
  return [darkModeOption.value, viewLogsOption.value, signatureOption.value, changeVaultPasswordOption.value];
});

const tabs = computed<SettingTab[]>(() => {
  return ['system', 'security'];
});

const form = reactive({
  [signatureOption.value.id]: settingStore.getRequireSignature,
  [darkModeOption.value.id]: settingStore.getDarkMode
});

watch(() => form[darkModeOption.value.id], (value) => {
  settingStore.setDarkMode(value);
  notificationStore.notify('Settings', `Dark mode ${value ? 'enabled' : 'disabled'}.`)
});

watch(() => form[signatureOption.value.id], (value) => {
  settingStore.setRequireSignature(value);
});

const getOptionsByTab = (tab: SettingTab): SettingItem[] => {
  return options.value
    // filter for tab
    .filter(option => option.tab === tab)
    // sort by toggle first
    .sort((a, b) => {
      if (a.type === 'toggle' && b.type !== 'toggle') {
        return -1;
      }

      if (a.type !== 'toggle' && b.type === 'toggle') {
        return 1;
      }

      return 0;
    });
};

</script>

<template>
  <BasePage title="Settings">
    <v-row justify="center">
      <v-col cols="11" md="6">
        <v-tabs v-model="tab" bg-color="primary">
          <v-tab v-for="tab in tabs" :key="tab" :value="tab">{{ tab }}</v-tab>
        </v-tabs>
      </v-col>

      <v-divider class="opacity-0" />

      <v-col cols="11" md="6">
        <v-window v-model="tab">
          <v-window-item :value="`${'system' as SettingTab}`">
            <v-list>
              <v-list-item v-for="option in getOptionsByTab('system')" :key="option.label" density="compact">
                <v-list-item-title class="text-bold">
                  {{ option.label }}
                </v-list-item-title>

                {{ option.description }}

                <v-list-item-action>
                  <v-switch v-if="option.type === 'toggle'" v-model="form[option.id]" flat inline color="success"
                    density="compact" class="px-3" />
                  <BaseBtn v-else :color="option.color" class="mt-2" :to="option.to">{{ option.prompt }}</BaseBtn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-window-item>

          <v-window-item :value="`${'security' as SettingTab}`">
            <v-list>
              <v-list-item v-for="option in getOptionsByTab('security')" :key="option.label" density="compact">
                <v-list-item-title class="text-bold">
                  {{ option.label }}
                </v-list-item-title>

                {{ option.description }}

                <v-list-item-action>
                  <v-switch v-if="option.type === 'toggle'" v-model="form[option.id]" flat inline color="success"
                    density="compact" class="px-3" />
                  <BaseBtn v-else :color="option.color" class="mt-2" :to="option.to">{{ option.prompt }}</BaseBtn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </BasePage>
</template>
