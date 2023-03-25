import { defineStore } from 'pinia';
import type { GenericLog, ErrorLog, InfoLog } from '~/common/utils'
import { Logger } from '~/common/utils'

interface NotificationStoreState {
  notifications: GenericLog[];
}

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationStoreState => ({
    notifications: []
  }),
  actions: {
    notify(title: string, message: string){
      const notification: InfoLog = { 
        type: 'info', 
        title, 
        message,
        timestamp: Date.now()
      };

      // push notification
      this.notifications.push(notification);

      // log notification
      return Logger.info(notification as InfoLog);
    },
    
    error(title: string, message: string, status?: number){

      const notification: ErrorLog = { 
        type: 'error', 
        title, 
        message,
        timestamp: Date.now(),
        status: status || 500
      };

      // push notification
      this.notifications.push(notification);

      // log notification
      return Logger.error(notification);
    }
  }
});
