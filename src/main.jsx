import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from '@/App.jsx'
import '@/index.css'
import '@/globals.css'
import { iniciarConsentimiento } from '@/lib/consentimiento'

// Meta, Google y Hotjar solo se cargan si ya había consentimiento (o al aceptar).
iniciarConsentimiento()

ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
)
