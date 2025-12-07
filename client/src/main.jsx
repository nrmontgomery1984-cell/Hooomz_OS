import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'
import { DevAuthProvider } from './contexts/DevAuthContext'
import { DevPersonaSwitcher, DevBorder, MobilePreviewToggle, MobilePreviewWrapper } from './components/dev'

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  registerSW({
    onNeedRefresh() {
      if (confirm('New content available. Reload?')) {
        window.location.reload()
      }
    },
    onOfflineReady() {
      console.log('App ready to work offline')
    },
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DevAuthProvider>
      <MobilePreviewWrapper>
        <DevBorder>
          <App />
          <DevPersonaSwitcher />
          <MobilePreviewToggle />
        </DevBorder>
      </MobilePreviewWrapper>
    </DevAuthProvider>
  </StrictMode>,
)
