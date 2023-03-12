import { defineStore } from 'pinia';
import { SESSION_STORAGE } from '~/logic';

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

interface SessionStoreState {
  session: string | undefined;
}
export const useSessionStore = defineStore('session', {
  state: (): SessionStoreState => ({
    session: SESSION_STORAGE.value || undefined
  }),
  getters: {
    hasSession(): boolean {
      return this.session !== undefined;
    }
  },
  actions: {
    setSession(session: string) {
      this.session = session;
    }
  }
});
