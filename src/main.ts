import { createApp } from 'vue'
import './styles/tokens.css'
import App from './App.vue'
import { registerSW } from 'virtual:pwa-register'

// Create app first
const app = createApp(App)
app.mount('#app')

// Register service worker for PWA with toast notifications
setTimeout(() => {
  registerSW({
    onNeedRefresh() {
      console.log('New content available, please refresh.')
      // Dispatch custom event for toast
      window.dispatchEvent(new CustomEvent('pwa-update', { 
        detail: { message: 'A new version is ready. Reload to get it.' } 
      }))
    },
    onOfflineReady() {
      console.log('App ready to work offline')
      // Dispatch custom event for toast
      window.dispatchEvent(new CustomEvent('pwa-ready', { 
        detail: { message: 'Ready to use offline.' } 
      }))
    },
  })
}, 100)
