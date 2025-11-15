import { createApp } from 'vue'
import './styles/globals.css'
import App from './App.vue'
import { registerSW } from 'virtual:pwa-register'

// Register service worker for PWA
registerSW({
  onNeedRefresh() {
    // Optional: show a prompt to user to reload the app
    console.log('New content available, please refresh.')
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
})

createApp(App).mount('#app')
