import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setTenantFromUrl } from './lib/tenant'
import App from './App'
import './style.css'

// Define a empresa pelo link (?org=slug) antes de renderizar — o cliente não preenche nada
setTenantFromUrl()

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
