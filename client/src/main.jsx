import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'
import { DevAuthProvider } from './contexts/DevAuthContext'
import { DevBorder } from './components/dev'
import { ToastProvider } from './components/ui'
import { ConfirmDialogProvider } from './hooks/useConfirmDialog'
import { logger } from './utils/logger'

// Load Google Maps Places API for address autocomplete
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
if (GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'your_google_maps_api_key') {
  const script = document.createElement('script')
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
  script.async = true
  script.defer = true
  document.head.appendChild(script)
}

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  registerSW({
    onNeedRefresh() {
      // This will be handled by the ConfirmDialogProvider once mounted
      // For now, use a simple notification approach
      logger.info('New content available - please refresh')
    },
    onOfflineReady() {
      logger.debug('App ready to work offline')
    },
  })
}

// Clear any stale mobile preview localStorage on load
localStorage.removeItem('hooomz-preview-mode')
localStorage.removeItem('hooomz-preview-device')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DevAuthProvider>
      <ToastProvider>
        <ConfirmDialogProvider>
          <DevBorder>
            <App />
          </DevBorder>
        </ConfirmDialogProvider>
      </ToastProvider>
    </DevAuthProvider>
  </StrictMode>,
)
