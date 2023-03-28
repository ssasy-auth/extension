import { ref } from 'vue';
import { defineStore } from 'pinia';
import { Logger } from '~/common/utils'
import type { GenericLog, ErrorLog, InfoLog } from '~/common/utils'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<GenericLog[]>([]);

  function notify(title: string, message: string){
    const notification: InfoLog = { 
      type: 'info', 
      title, 
      message,
      timestamp: Date.now()
    };

    // push notification
    notifications.value.push(notification);

    // log notification
    return Logger.info(notification as InfoLog);
  }

  function error(title: string, message: string, status?: number){

    const notification: ErrorLog = { 
      type: 'error', 
      title, 
      message,
      timestamp: Date.now(),
      status: status || 500
    };

    // push notification
    notifications.value.push(notification);

    // log notification
    return Logger.error(notification);
  }

  return {
    notifications,
    notify,
    error
  }
});
