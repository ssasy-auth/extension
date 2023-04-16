import type { App } from 'vue'
import { getCurrentContext } from 'webext-bridge'
import VuetifyPlugin from '~/plugins/vuetify-plugin'
import PiniaPlugin from '~/plugins/pinia-plugin'

export function setupApp(app: App, config?: { blockVuetify?: boolean, blockPinia?: boolean }) {
  const context = getCurrentContext()

  // Inject a globally available `$app` object in template
  app.config.globalProperties.$app = { context }

  // Provide access to `app` in script setup with `const app = inject('app')`
  app.provide('app', app.config.globalProperties.$app)

  // Here you can install additional plugins for all contexts: popup, options page and content-script.
  // example: app.use(i18n)
  // example excluding content-script context: if (context !== 'content-script') app.use(i18n)
  if(config?.blockVuetify !== true){
    app.use(VuetifyPlugin);
  }

  if(config?.blockPinia !== true){
    app.use(PiniaPlugin);
  }
}
