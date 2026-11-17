import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from '@/App.jsx'
import '@/index.css'
import '@/globals.css'
import { iniciarConsentimiento } from '@/lib/consentimiento'
import { activarFormulariosMailerLite } from '@/lib/mailerliteSinScript'

// Meta, Google y Hotjar solo se cargan si ya había consentimiento (o al aceptar).
iniciarConsentimiento()

// Formularios de MailerLite enviados por fetch, sin su script (que deja ml_guid sin consentimiento).
activarFormulariosMailerLite()

ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
)
