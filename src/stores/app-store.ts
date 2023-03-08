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
    notify(title: string, message: string){
      const notification: Notification = { 
        type: 'info', 
        title, 
        message 
      };

      this.notifications.push(notification);
      
      logNotification(notification);
    },
    error(title: string, message: string, status?: number){

      const notification: Notification = { 
        type: 'error', 
        title, 
        message,
        status: status || 500
      };

      // push notification
      this.notifications.push(notification);
      
      // log notification
      logNotification(notification);
    }
  }
});

function formatNotification(notification: Notification){
  const emoji = notification.type === 'error' ? '❗️' : '📣';
  return `[ssasy ${emoji}] ${notification.title} - ${notification.message}`;
}

function logNotification(notification: Notification){
  console.log(formatNotification(notification));
}