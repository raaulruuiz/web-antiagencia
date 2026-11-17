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

// Cada página se descarga aparte. Si se publica una versión nueva con una pestaña abierta,
// la parte antigua ya no existe: recargamos una vez para traer la nueva en vez de dejar la pantalla en blanco.
window.addEventListener('vite:preloadError', (event) => {
  const ultima = Number(sessionStorage.getItem('recarga-version') || 0)
  if (Date.now() - ultima < 10000) return
  event.preventDefault()
  sessionStorage.setItem('recarga-version', String(Date.now()))
  window.location.reload()
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
)
