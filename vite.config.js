import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Solo en local (vista previa): el backend no admite el origen 127.0.0.1, así que
  // las llamadas públicas del calendario pasan por aquí. En producción no se usa.
  server: {
    proxy: {
      '/__calendly': {
        target: 'https://automatizaciones-production-a376.up.railway.app',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/__calendly/, '/public/calendly'),
        configure: (proxy) => proxy.on('proxyReq', (req) => req.removeHeader('origin')),
      },
    },
  },
})
