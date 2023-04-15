<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSettingStore, useNotificationStore } from '~/common/stores/app';
import type { ActionItem } from '~/components/Base/BaseCard.vue';
import BasePage from '~/components/Base/BasePage.vue';
import BaseBtn from '~/components/Base/BaseBtn.vue';

const route = useRoute();
const router = useRouter();
const settingStore = useSettingStore();
const notificationStore = useNotificationStore();

type SettingType = 'toggle' | 'action';

type SettingTab = 'system' | 'security';

interface SettingItem extends ActionItem {
  id: string;
  tab: SettingTab;
  type: SettingType;
  prompt?: string;
}

const tabs = ref<SettingTab[]>([ 'system', 'security' ]);

const tab = ref<SettingTab>(_getRouteTab() || 'system');

const signatureOption = ref<SettingItem>({
  id: 'signature',
  tab: 'security',
  type: 'toggle',
  label: 'Require signature on login',
  description: 'Require services to provide a signature proving that you registered with a service before logging in (Recommended against phishing).'
});

const darkModeOption = ref<SettingItem>({
  id: 'dark-mode',
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

const exportVaultKey = ref<SettingItem>({
  id: 'export-vault-key',
  tab: 'security',
  type: 'action',
  label: 'Export Private Key',
  prompt: 'Export key',
  description: 'Export your private key as a JSON file.',
  to: '/key/?tab=private'
});

const changeVaultPasswordOption = ref<SettingItem>({
  id: 'change-vault-password',
  tab: 'security',
  type: 'action',
  label: 'Edit vault password',
  prompt: 'Change password',
  description: 'Change the password used to encrypt your key.',
  color: 'error',
  to: '/settings/vault/password'
});

const deleteVaultKey = ref<SettingItem>({
  id: 'delete-vault-key',
  tab: 'security',
  type: 'action',
  label: 'Delete encrypted vault key',
  prompt: 'Delete encrypted key',
  description: 'Delete your encrypted vault key. This action is irreversible.',
  color: 'error',
  to: '/settings/vault/key'
});

const options = ref<SettingItem[]>([
  signatureOption.value,
  darkModeOption.value,
  viewLogsOption.value,
  exportVaultKey.value,
  changeVaultPasswordOption.value,
  deleteVaultKey.value
]);

const form = reactive({
  [signatureOption.value.id]: settingStore.setting.requireSignature,
  [darkModeOption.value.id]: settingStore.setting.darkMode
});

function getOptionsByTab (tab: SettingTab): SettingItem[] {
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
}

function _getRouteTab (): SettingTab | undefined {
  const tab = route.query.tab as SettingTab | undefined;

  if(!tab) {
    return undefined;
  }

  // TODO: validate tab
  return tab;
}

watch(() => form[darkModeOption.value.id], (value) => {
  settingStore.setDarkMode(value);
  notificationStore.notify('Settings', `Dark mode ${value ? 'enabled' : 'disabled'}.`)
});

watch(() => form[signatureOption.value.id], (value) => {
  settingStore.setRequireSignature(value);
});

watch(() => tab.value, (value) => {
  router.replace({
    query: {
      tab: value
    }
  });
});

onMounted(async () => {
  const darkMode: boolean = await settingStore.isDarkMode();
  const requireSignature: boolean = await settingStore.isRequireSignature();

  form[darkModeOption.value.id] = darkMode;
  form[signatureOption.value.id] = requireSignature;
});

</script>

<template>
  <base-page title="Settings">
    <v-row justify="center">
      <v-col
        cols="11"
        md="6">
        <v-tabs
          v-model="tab"
          bg-color="primary">
          <v-tab
            v-for="tab in tabs"
            :key="tab"
            :value="tab">{{ tab }}</v-tab>
        </v-tabs>
      </v-col>

      <v-divider class="border-opacity-0" />

      <v-col
        cols="11"
        md="6">
        <v-window v-model="tab">
          <v-window-item :value="`${'system' as SettingTab}`">
            <v-list>
              <v-list-item
                v-for="option in getOptionsByTab('system')"
                :key="option.label"
                density="compact">
                <v-row
                  justify-md="space-between"
                  no-gutters>
                  <v-col
                    cols="12"
                    md="6">
                    <v-list-item-title class="text-bold">
                      {{ option.label }}
                    </v-list-item-title>
                    {{ option.description }}
                  </v-col>

                  <v-col cols="auto">
                    <v-switch
                      v-if="option.type === 'toggle'"
                      v-model="form[option.id]"
                      flat
                      inline
                      color="success"
                      density="compact"
                      class="px-3" />
                    <base-btn
                      v-else
                      :color="option.color"
                      :to="option.to"
                      @click="option.action">{{
                        option.prompt }}</base-btn>
                  </v-col>
                </v-row>
              </v-list-item>
            </v-list>
          </v-window-item>

          <v-window-item :value="`${'security' as SettingTab}`">
            <v-list>
              <div
                v-for="option, index in getOptionsByTab('security')"
                :key="option.label">
                <v-list-item
                  density="compact"
                  class="mt-2">
                  <v-row justify-md="space-between">
                    <v-col
                      cols="12"
                      md="6">
                      <v-list-item-title class="text-bold">
                        {{ option.label }}
                      </v-list-item-title>
                      {{ option.description }}
                    </v-col>

                    <v-col cols="auto">
                      <v-switch
                        v-if="option.type === 'toggle'"
                        v-model="form[option.id]"
                        flat
                        inline
                        color="success"
                        density="compact"
                        class="px-3" />
                      <base-btn
                        v-else
                        :color="option.color"
                        :to="option.to"
                        @click="option.action">{{
                          option.prompt }}</base-btn>
                    </v-col>
                  </v-row>
                </v-list-item>

                <v-divider
                  v-if="index + 1 < getOptionsByTab('security').length"
                  class="mt-2 border-opacity-50" />
              </div>
            </v-list>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </base-page>
</template>
