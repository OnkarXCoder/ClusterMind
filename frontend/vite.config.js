import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    open: true,
    hmr: {
      host: '127.0.0.1',
      protocol: 'ws',
      clientPort: 5173,
    },
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
