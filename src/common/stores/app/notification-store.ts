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

export const useNotificationStore = defineStore('notification', {
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

      // push notification
      this.notifications.push(notification);

      // format notification
      const formattedNotification = formatNotification(notification);

      // log notification
      console.log(formattedNotification);
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

      // format notification
      const formattedNotification = formatNotification(notification);
      
      // log notification
      console.error(formattedNotification);

      return formattedNotification;
    }
  }
});

/**
 * Returns a formatted notification
 * 
 * @param notification - Notification to format
 * @returns string
 */
function formatNotification(notification: Notification){
  const emoji = notification.type === 'error' ? '❗️' : '📣';
  return `[ssasy ${emoji}] ${notification.title} - ${notification.message}`;
}