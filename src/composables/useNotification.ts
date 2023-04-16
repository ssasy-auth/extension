import { toast } from 'vue-sonner'
import { defineComponent, h, shallowRef } from 'vue'
import MessageCardVue from '~/components/cards/MessageCard.vue'
import type { DefineComponent } from 'vue'

export type NotificationType = 'general' | 'warning' | 'error' | 'success';

export function useNotification() {
  interface HtmlNotification {
    type: NotificationType
    component: DefineComponent
  }

  function _trigger(notification: HtmlNotification) { 
    toast(shallowRef(notification.component));
  }

  function _mapTypeToColor(type: NotificationType): string {
    switch (type) {
    case 'general':
      return 'info';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    case 'success':
      return 'success';
    default:
      return 'primary';
    }
  }

  function notify(title: string, message: string, type: NotificationType = 'general') {
    const _message = `<b>${title}</b> <p>${message}</p>`;
    
    const notification: HtmlNotification = { 
      type, 
      component: defineComponent({
        render() {
          return h(MessageCardVue, { 
            message: _message, 
            color: _mapTypeToColor(type), 
            htmlIsh: true
          });
        }
      })
    };

    _trigger(notification)
  }

  return {
    notify
  }
}
