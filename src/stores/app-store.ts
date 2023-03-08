import { defineStore } from 'pinia';

type NotificationType = 'info' | 'error';
interface Notification {
  type: NotificationType;
  title: string;
  message: string;
  status?: number
}
interface NotificationStoreState {
  notifications: Notification[];
}
export const useNotificationStore = defineStore('notificationStore', {
  state: (): NotificationStoreState => ({
    notifications: []
  }),
  actions: {
    notify(title: string, message: string, status?: number){
      const notification: Notification = { 
        type: status ? 'error' : 'info', 
        title, 
        message,
        status 
      };

      this.notifications.push(notification);
      console.log(notification);
    }
  }
});