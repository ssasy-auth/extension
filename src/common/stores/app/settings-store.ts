import { defineStore } from 'pinia';
import { useLocalStorage } from '~/composables/useLocalStorage';
import type { RemovableRef } from '@vueuse/core';
interface SystemSetting {
  /**
   * Whether or not the signature is required
   */
  requireSignature: boolean;
  /**
   * Whether or not the dark mode is enabled
   */
  darkMode: boolean;
}

const STORAGE_KEY = 'store-setting';
const LocalSetting: RemovableRef<SystemSetting | undefined> = useLocalStorage(STORAGE_KEY, undefined);

interface SettingStoreState {
  setting: SystemSetting;
}

export const useSettingStore = defineStore('setting', {
  state: (): SettingStoreState => ({
    setting: LocalSetting.value || { requireSignature : true, darkMode: false }
  }),
  getters: {
    getDarkMode(): boolean {
      return this.setting.darkMode;
    },
    getRequireSignature(): boolean {
      return this.setting.requireSignature;
    }
  },
  actions: {
    setDarkMode(value: boolean) {
      this.setting.darkMode = value;
      LocalSetting.value = this.setting;
    },
    setRequireSignature(value: boolean) {
      this.setting.requireSignature = value;
      LocalSetting.value = this.setting;
    }
  }
});