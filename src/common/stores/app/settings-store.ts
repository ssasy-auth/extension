import { defineStore } from 'pinia';
import { StorageUtil } from '~/common/utils';

const LocalSetting = StorageUtil.Setting;
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

interface SettingStoreState {
  setting: SystemSetting;
}

export const useSettingStore = defineStore('setting', {
  state: (): SettingStoreState => ({
    setting: LocalSetting.value as SystemSetting || { requireSignature : true, darkMode: false }
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