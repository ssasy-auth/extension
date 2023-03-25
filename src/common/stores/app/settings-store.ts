import { defineStore } from 'pinia';
import { LocalStorage } from '~/common/utils';

interface SettingStoreState {
  darkMode: boolean;
  requireSignature: boolean;
}

export const useSettingStore = defineStore('setting', {
  state: (): SettingStoreState => ({
    darkMode: setupDarkMode(),
    requireSignature: setupRequireSignature()
  }),
  actions: {
    setDarkMode(value: boolean) {
      this.darkMode = value;
      LocalStorage.SettingDarkMode.set(value.toString());
    },
    setRequireSignature(value: boolean) {
      this.requireSignature = value;
      LocalStorage.SettingRequireSignature.set(value.toString());
    }
  }
});

function setupDarkMode(): boolean {
  const darkMode = LocalStorage.SettingDarkMode.get();

  if(darkMode === undefined) {
    return false;
  }

  return darkMode === 'true' ? true : false;
}

function setupRequireSignature(): boolean {
  const requireSignature = LocalStorage.SettingRequireSignature.get();

  if(requireSignature === undefined) {
    return false;
  }

  return requireSignature === 'true' ? true : false;
}