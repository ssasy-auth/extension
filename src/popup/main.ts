import { createApp } from 'vue'
import { setupApp } from '~/utils/setup'
import App from './Popup.vue'
import Router from './router'
import '~/styles'

const app = createApp(App)
setupApp(app)
app.use(Router)
app.mount('#app')
