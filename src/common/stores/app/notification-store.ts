import { ref } from 'vue';
import { defineStore } from 'pinia';
import { Logger } from '~/common/utils'
import { useNotification } from '~/composables/useNotification';
import type { NotificationType } from '~/composables/useNotification';
import type { GenericLog, ErrorLog, InfoLog, LogType } from '~/common/utils';

interface NotificationConfig {
  toast?: boolean;
}

export const useNotificationStore = defineStore('notification', () => {
  const toaster = useNotification();
  const notifications = ref<GenericLog[]>([]);

  function notify(
    title: string, 
    message: string, 
    config?: NotificationConfig
  ){
    const notification: InfoLog = { 
      type: 'info', 
      title, 
      message,
      timestamp: Date.now()
    };

    // push notification
    notifications.value.push(notification);

    if(config?.toast){
      // toast notification
      toaster.notify(notification.title, notification.message as string, _mapNotificationType(notification.type));
    }

    // log notification
    return Logger.info(notification as InfoLog);
  }

  function error(
    title: string,
    message: string,
    config?: NotificationConfig
  ): string {
    const notification: ErrorLog = { 
      type: 'error', 
      title, 
      message,
      timestamp: Date.now()
    };

    // push notification
    notifications.value.push(notification);

    // toast notification
    if(config?.toast){
      let type = _mapNotificationType(notification.type);

      if(notification.title.toLocaleLowerCase().includes('warn') || notification.message.toLocaleLowerCase().includes('warn')){
        type = 'warning';
      }

      toaster.notify(notification.title, notification.message as string, type );
    }

    // log notification
    return Logger.error(notification);
  }

  function _mapNotificationType(type: LogType): NotificationType {
    return type === 'error' ? 'error' : 'general';
  }

  return {
    notifications,
    notify,
    error
  }
});
