import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useLocalStorage } from '~/composables/useLocalStorage';
import { useBrowserStorage } from '~/composables/useBrowserStorage';
import { StorageEnum } from '~/composables/useBrowserStorage';
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

const LocalSetting: RemovableRef<SystemSetting | undefined> = useLocalStorage(StorageEnum.SETTING, undefined);

export const useSettingStore = defineStore('setting', () => {
  const setting = ref<SystemSetting>(LocalSetting.value || { requireSignature : true, darkMode: false });

  async function isDarkMode (): Promise<boolean> {
    const localSetting: SystemSetting | undefined = await useBrowserStorage('SETTING').get();

    if(localSetting){
      return localSetting.darkMode;
    }

    return setting.value.darkMode;
  }

  async function isRequireSignature (): Promise<boolean> {
    const localSetting: SystemSetting | undefined = await useBrowserStorage('SETTING').get();

    if(localSetting){
      return localSetting.requireSignature;
    }
    
    return setting.value.requireSignature;
  }

  function setDarkMode (value: boolean) {
    setting.value.darkMode = value;
    LocalSetting.value = setting.value;
  }

  function setRequireSignature (value: boolean) {
    setting.value.requireSignature = value;
    LocalSetting.value = setting.value;
  }

  return {
    setting,
    isDarkMode,
    isRequireSignature,
    setDarkMode,
    setRequireSignature
  };
});
