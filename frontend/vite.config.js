import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    open: true,
    allowedHosts: ['miah-traceried-aliyah.ngrok-free.dev'],
    hmr: {
      host: 'miah-traceried-aliyah.ngrok-free.dev',
      protocol: 'ws',
      clientPort: 443,
    },
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
