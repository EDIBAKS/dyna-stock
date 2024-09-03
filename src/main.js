//import './assets/main.css'
import './index.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { Quasar } from 'quasar';
import quasarUserOptions from './assets/quasar-user-options';
// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css
import 'quasar/src/css/index.sass'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Quasar,quasarUserOptions)
  
app.mount('#app')
