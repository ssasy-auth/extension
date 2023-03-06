import { defineStore } from "pinia";

enum NotificationType {
  General = "notification-general",
  Error = "notification-error"
}

interface Notification {
  type: NotificationType;
  title: string;
  message: string;
  color: "primary" | "secondary" | "success" | "info" | "warning" | "error";
}

export const useNavStore = defineStore("nav", {
  state: () => ({
    sidebar: false
  }),
  getters: {
    showSidebar: (state) => (): boolean => state.sidebar
  },
  actions: {
    setSidebar(value: boolean) {
      this.sidebar = value;

      return this.sidebar;
    }
  }
});

export const useNotificationStore = defineStore("notifications", {
  state: () => ({
    notifications: [] as Notification[]
  }),
  getters: {
    getNotifications: (state) => (): Notification[] => state.notifications,
    getErrorNotifications: (state) => (): Notification[] => {
      return state.notifications.filter((notification) => {
        return notification.type === NotificationType.Error;
      });
    }
  },
  actions: {
    addNotification(title: string, message: string) {
      console.error("📣", title, message);
      this.notifications.push({
        type: NotificationType.General,
        title,
        message,
        color: "error"
      });
    },
    addError(title: string, message: string) {
      console.error("❗️", title, message);
      this.notifications.push({
        type: NotificationType.Error,
        title,
        message,
        color: "error"
      });
    }
  }
});
