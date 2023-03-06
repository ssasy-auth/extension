import { createApp } from "vue";

// Vue
import App from "./App.vue";
import Router from "./router";

// Vuetify
import Vuetify from "./plugins/vuetify";

// Pinia
import Pinia from "./plugins/pinia";

// Styles
import "vuetify/styles"
import "./assets/main.css";

const app = createApp(App)

app.use(Pinia);
app.use(Router);
app.use(Vuetify);

app.mount("#app");
