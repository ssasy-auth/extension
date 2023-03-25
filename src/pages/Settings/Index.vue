<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useSettingStore } from '~/common/stores/app';
import type { ActionItem } from '~/components/Base/BaseCard.vue';

const settingStore = useSettingStore();

interface SettingItem extends ActionItem {
  id: string;
  prompt?: string;
};

const signatureOption = ref<SettingItem>({
  id: 'signature',
  label: 'Require signature on login',
  description: 'Require services to provide a signature proving that you registered with a service before logging in (Recommended against phishing).'
});

const darkModeOption = ref<SettingItem>({
  id: 'darkMode',
  label: 'Enable dark mode',
  description: 'Set the theme to dark mode.'
});

const vaultPasswordOption: SettingItem = {
  id: 'vaultPassword',
  label: 'Edit vault password',
  prompt: 'Change password',
  description: 'Change the password used to encrypt your key.',
  color: 'error',
  to: '/settings/vault'
};

const generalOptions = computed<SettingItem[]>(() => {
  return [signatureOption.value, darkModeOption.value];
});

const sensitiveOptions = computed<SettingItem[]>(() => {
  return [vaultPasswordOption];
});

const form = reactive({
  [signatureOption.value.id]: settingStore.requireSignature,
  [darkModeOption.value.id]: settingStore.darkMode
});

watch(() => form[darkModeOption.value.id], (value) => {
  settingStore.setDarkMode(value);
});

watch(() => form[signatureOption.value.id], (value) => {
  settingStore.setRequireSignature(value);
});

</script>

<template>
  <BasePage title="Settings">
    <v-row justify="center">
      <v-col cols="11" md="6">
        <v-list>
          <div v-for="option, index in generalOptions" :key="option.label">
            <v-divider v-if="index > 0" />
            <v-list-item>
              <v-list-item-title class="text-bold">{{ option.label }}</v-list-item-title>
              {{ option.description }}
              
              <v-list-item-action class="px-3">
                <v-switch v-model="form[option.id]" color="success" />
              </v-list-item-action>
            </v-list-item>
          </div>

          <v-divider v-if="generalOptions.length > 0 && sensitiveOptions.length > 0" />

          <div v-for="option, index in sensitiveOptions" :key="option.label">
            <v-divider v-if="index > 0" />
            <v-list-item>
              <v-list-item-title class="text-bold">{{ option.label }}</v-list-item-title>
              {{ option.description }}
              
              <v-list-item-action class="mt-2">
                <BaseBtn :color="option.color" :to="option.to">
                  {{ option.prompt }}
                </BaseBtn>
              </v-list-item-action>
            </v-list-item>
          </div>
        </v-list>
      </v-col>
    </v-row>
  </BasePage>
</template>
