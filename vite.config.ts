import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    port: 5173,
    host: true,
    strictPort: false
  },
  plugins: [
    react()
    // PWAを完全に無効化（開発中）
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})