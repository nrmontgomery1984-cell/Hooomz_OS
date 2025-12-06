import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { DevAuthProvider } from './contexts/DevAuthContext'
import { DevPersonaSwitcher, DevBorder } from './components/dev'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DevAuthProvider>
      <DevBorder>
        <App />
        <DevPersonaSwitcher />
      </DevBorder>
    </DevAuthProvider>
  </StrictMode>,
)
