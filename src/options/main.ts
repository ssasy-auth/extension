import { createApp } from 'vue'
import { setupApp } from '~/common/utils/setup'
import App from './Options.vue'
import Router from './router'
import '../common/styles'

const app = createApp(App)
setupApp(app)
app.use(Router)
app.mount('#app')
